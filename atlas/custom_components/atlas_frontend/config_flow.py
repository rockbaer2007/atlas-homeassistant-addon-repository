"""Configure the existing ATLAS runtime; no HA or provider token is requested."""
from homeassistant import config_entries
import voluptuous as vol

from .const import CONF_RUNTIME_URL, DOMAIN, normalize_runtime_url


def _schema(default: str = "") -> vol.Schema:
    return vol.Schema({vol.Required(CONF_RUNTIME_URL, default=default): str})


class AtlasFrontendConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    @staticmethod
    def async_get_options_flow(config_entry):
        return AtlasFrontendOptionsFlow()

    async def async_step_user(self, user_input=None):
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        errors = {}
        if user_input is not None:
            try:
                value = normalize_runtime_url(user_input[CONF_RUNTIME_URL])
            except (ValueError, KeyError):
                errors[CONF_RUNTIME_URL] = "invalid_runtime_url"
            else:
                return self.async_create_entry(title="ATLAS Runtime", data={CONF_RUNTIME_URL: value})
        return self.async_show_form(step_id="user", data_schema=_schema((user_input or {}).get(CONF_RUNTIME_URL, "")), errors=errors)


class AtlasFrontendOptionsFlow(config_entries.OptionsFlow):
    async def async_step_init(self, user_input=None):
        errors = {}
        if user_input is not None:
            try:
                value = normalize_runtime_url(user_input[CONF_RUNTIME_URL])
            except (ValueError, KeyError):
                errors[CONF_RUNTIME_URL] = "invalid_runtime_url"
            else:
                return self.async_create_entry(title="", data={CONF_RUNTIME_URL: value})
        default = self.config_entry.options.get(CONF_RUNTIME_URL, self.config_entry.data[CONF_RUNTIME_URL])
        return self.async_show_form(step_id="init", data_schema=_schema((user_input or {}).get(CONF_RUNTIME_URL, default)), errors=errors)
