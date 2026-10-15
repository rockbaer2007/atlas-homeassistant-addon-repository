"""Isolated contract checks, executed with the actual HA Python dependencies."""
import asyncio
from copy import deepcopy
import json
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, Mock, patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from homeassistant.exceptions import ConfigEntryError
from custom_components.atlas_frontend import async_migrate_entry, async_setup_entry, async_unload_entry
from custom_components.atlas_frontend.const import DOMAIN, PANEL_PATH, VERSION, normalize_runtime_url
from custom_components.atlas_frontend.config_flow import AtlasFrontendConfigFlow


class UrlTests(unittest.TestCase):
    def test_preserves_ports_paths_and_ipv6(self):
        self.assertEqual(normalize_runtime_url("http://atlas.local:80/proxy/atlas"), "http://atlas.local:80/proxy/atlas/")
        self.assertEqual(normalize_runtime_url("http://[::1]:4176/"), "http://[::1]:4176/")

    def test_rejects_credentials_and_unsafe_urls(self):
        for value in ("", "file:///config", "//host", "http://user:secret@host/", "http://host/?token=secret", "http://host/#secret", "http://host:0", "http://host:65536", "http://host/../", "http://host/%2f/", "http://host/ a", "http://host/a\\b"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                normalize_runtime_url(value)

    def test_locale_keys_and_versions_match(self):
        component = ROOT / "custom_components/atlas_frontend"
        def keys(value, prefix=""):
            return {prefix} | set().union(*(keys(v, prefix + "." + k) for k, v in value.items())) if isinstance(value, dict) else {prefix}
        source = json.loads((component / "strings.json").read_text())
        for locale in ("de", "en", "fr"):
            self.assertEqual(keys(source), keys(json.loads((component / f"translations/{locale}.json").read_text())))
        manifest = json.loads((component / "manifest.json").read_text())
        # HACS integration and Node App releases have independent versions.
        self.assertEqual(manifest["version"], VERSION)


class PanelTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.hass = SimpleNamespace(data={}, http=SimpleNamespace(async_register_static_paths=AsyncMock()))
        self.entry = SimpleNamespace(entry_id="own-test-entry", data={"runtime_url": "http://atlas.local:4176/"}, options={}, async_on_unload=Mock(), add_update_listener=Mock())

    async def test_release_update_keeps_entry_identity_options_and_schema(self):
        self.entry.version = 1
        self.entry.minor_version = 1
        self.entry.unique_id = DOMAIN
        self.entry.data["preserve_future_key"] = {"value": [1, 2]}
        self.entry.options = {"runtime_url": "https://atlas.local/proxy/", "preserve_option": True}
        before = deepcopy(vars(self.entry))
        self.assertTrue(await async_migrate_entry(self.hass, self.entry))
        for key in ("entry_id", "unique_id", "data", "options", "version", "minor_version"):
            self.assertEqual(getattr(self.entry, key), before[key])
        self.assertEqual(AtlasFrontendConfigFlow.VERSION, 1)
        self.assertEqual(AtlasFrontendConfigFlow.MINOR_VERSION, 1)

    async def test_unknown_schema_is_rejected_without_rewriting_entry(self):
        for major, minor in ((2, 1), (1, 2), (0, 1), (1, 0)):
            self.entry.version, self.entry.minor_version = major, minor
            before = deepcopy(self.entry.data), deepcopy(self.entry.options)
            self.assertFalse(await async_migrate_entry(self.hass, self.entry))
            self.assertEqual((self.entry.version, self.entry.minor_version), (major, minor))
            self.assertEqual((self.entry.data, self.entry.options), before)
        self.hass.http.async_register_static_paths.assert_not_called()

    async def test_invalid_saved_url_fails_before_registering_any_panel(self):
        for value in (None, "http://user:secret@host", "http://host:invalid", "file:///config"):
            self.entry.options = {"runtime_url": value}
            with self.assertRaises(ConfigEntryError) as raised:
                await async_setup_entry(self.hass, self.entry)
            self.assertNotIn("secret", str(raised.exception))
        self.hass.http.async_register_static_paths.assert_not_called()
        self.assertEqual(self.hass.data, {})

    async def test_options_can_recover_a_missing_data_url(self):
        self.entry.data = {}
        self.entry.options = {"runtime_url": "https://atlas.local/proxy/"}
        with patch("custom_components.atlas_frontend.ha_frontend.async_panel_exists", return_value=False), patch("custom_components.atlas_frontend.panel_custom.async_register_panel", new_callable=AsyncMock) as register:
            self.assertTrue(await async_setup_entry(self.hass, self.entry))
            self.assertEqual(register.call_args.kwargs["config"], self.entry.options)
            self.assertEqual(self.entry.data, {})

    async def test_registration_is_admin_only_and_contains_no_token(self):
        with patch("custom_components.atlas_frontend.ha_frontend.async_panel_exists", return_value=False), patch("custom_components.atlas_frontend.panel_custom.async_register_panel", new_callable=AsyncMock) as register:
            await async_setup_entry(self.hass, self.entry)
            self.assertTrue(register.call_args.kwargs["require_admin"])
            self.assertEqual(register.call_args.kwargs["config"], {"runtime_url": "http://atlas.local:4176/"})
            self.assertEqual(self.entry.data, {"runtime_url": "http://atlas.local:4176/"})
            self.assertEqual(self.hass.http.async_register_static_paths.await_count, 1)
            with patch("custom_components.atlas_frontend.ha_frontend.async_remove_panel") as remove:
                await async_unload_entry(self.hass, SimpleNamespace(entry_id="other-entry"))
                remove.assert_not_called()
                await async_unload_entry(self.hass, self.entry)
                remove.assert_called_once_with(self.hass, PANEL_PATH, warn_if_unknown=False)
            await async_setup_entry(self.hass, self.entry)
            self.assertEqual(self.hass.http.async_register_static_paths.await_count, 1)

    async def test_panel_collision_never_overwrites(self):
        with patch("custom_components.atlas_frontend.ha_frontend.async_panel_exists", return_value=True), patch("custom_components.atlas_frontend.panel_custom.async_register_panel", new_callable=AsyncMock) as register:
            with self.assertRaises(Exception):
                await async_setup_entry(self.hass, self.entry)
            register.assert_not_called()
            self.hass.http.async_register_static_paths.assert_not_called()

    async def test_options_take_precedence_without_changing_existing_data(self):
        self.entry.options = {"runtime_url": "https://atlas.local/proxy/"}
        with patch("custom_components.atlas_frontend.ha_frontend.async_panel_exists", return_value=False), patch("custom_components.atlas_frontend.panel_custom.async_register_panel", new_callable=AsyncMock) as register:
            await async_setup_entry(self.hass, self.entry)
            self.assertEqual(register.call_args.kwargs["config"], self.entry.options)
            self.assertEqual(self.entry.data["runtime_url"], "http://atlas.local:4176/")

    async def test_config_flow_rejects_secret_urls_and_accepts_normalized_base(self):
        flow = AtlasFrontendConfigFlow()
        flow.async_set_unique_id = AsyncMock()
        flow._abort_if_unique_id_configured = Mock()
        flow.async_show_form = Mock(return_value="form")
        flow.async_create_entry = Mock(return_value="entry")
        self.assertEqual(await flow.async_step_user({"runtime_url": "http://user:secret@host"}), "form")
        self.assertEqual(flow.async_show_form.call_args.kwargs["errors"], {"runtime_url": "invalid_runtime_url"})
        self.assertEqual(await flow.async_step_user({"runtime_url": "https://atlas.local/proxy"}), "entry")
        self.assertEqual(flow.async_create_entry.call_args.kwargs["data"], {"runtime_url": "https://atlas.local/proxy/"})


if __name__ == "__main__":
    unittest.main()
