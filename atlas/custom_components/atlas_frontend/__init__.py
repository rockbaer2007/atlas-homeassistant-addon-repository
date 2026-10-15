"""Register the ATLAS runtime panel without taking ownership of ATLAS data."""
from pathlib import Path

from homeassistant.components import frontend as ha_frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError

from .const import CONF_RUNTIME_URL, DOMAIN, PANEL_PATH, VERSION, normalize_runtime_url


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    try:
        runtime_url = normalize_runtime_url(entry.options.get(CONF_RUNTIME_URL, entry.data.get(CONF_RUNTIME_URL)))
    except ValueError:
        # Do not log the rejected value: a manually edited URL could contain secrets.
        raise ConfigEntryError("Invalid ATLAS runtime URL; check integration options") from None
    # Never replace the add-on's Ingress entry or another integration's panel.
    if ha_frontend.async_panel_exists(hass, PANEL_PATH):
        raise ConfigEntryError("ATLAS panel path is already in use")
    state = hass.data.setdefault(DOMAIN, {})
    if not state.get("static_registered"):
        await hass.http.async_register_static_paths([
            StaticPathConfig(f"/{DOMAIN}/frontend", str(Path(__file__).parent / "frontend"), cache_headers=False),
        ])
        state["static_registered"] = True
    await panel_custom.async_register_panel(
        hass=hass,
        frontend_url_path=PANEL_PATH,
        webcomponent_name="atlas-runtime-panel",
        module_url=f"/{DOMAIN}/frontend/atlas-homeassistant-panel.js?version={VERSION}",
        sidebar_title="ATLAS Runtime",
        sidebar_icon="mdi:view-dashboard-edit",
        require_admin=True,
        config={CONF_RUNTIME_URL: runtime_url},
    )
    state["entry_id"] = entry.entry_id
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    return True


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Keep schema 1 unchanged and refuse unknown schemas without rewriting data.

    Integration releases and config-entry schemas have separate versions. There
    is no data migration for a release that still uses schema 1.1. In particular,
    a downgrade must never relabel an entry written by a future schema.
    """
    return entry.version == 1 and entry.minor_version == 1


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    state = hass.data.get(DOMAIN, {})
    if state.get("entry_id") == entry.entry_id:
        ha_frontend.async_remove_panel(hass, PANEL_PATH, warn_if_unknown=False)
        state.pop("entry_id", None)
    return True


async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)
