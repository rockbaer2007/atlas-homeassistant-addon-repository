# ATLAS Administration Demo

The administration demo is the first separate management surface for ATLAS
plugins and central Home Assistant connection settings.

Run `pnpm build`, then start it with:

```sh
node examples/admin-demo/server.mjs
```

Open `http://127.0.0.1:4175/`.

The Home Assistant Card Editor demo remains separate on
`http://127.0.0.1:4174/`.
For the standalone app packaging path, `pnpm start:app` starts Administration
and the Card Editor together and exposes a health endpoint on
`http://127.0.0.1:4176/health`. The same app server also exposes
`http://127.0.0.1:4176/app` with runtime links, ports and distribution order
for Docker, Home Assistant App/Add-on and Linux installer packaging.

The admin surface currently shows the Home Assistant Card Editor as the first
reference plugin, renders Runtime plugin status and capabilities, opens the Card
Editor with a browser-session handoff, and exports the generated
`.atlas-plugin.json` package descriptor. It can also import `.atlas-plugin.json`
packages back into the local administration list as validated descriptors. The
import path does not execute plugin code; it only reads package metadata so the
plugin can be inspected, activated in the demo state, exported again or removed
from the local import list.
The administration view also includes an App release readiness panel for the
Card Editor. It tracks the local-preview entrypoints, completed safeguards such
as the opt-in problem report flow, the reference plugin package path and the
remaining standalone/HACS release targets.
The preferred distribution order is: first a standalone Docker container for
Administration plus Card Editor, then a Home Assistant App/Add-on package
derived from the same container/runtime, then an optional Linux installer for
VM, LXC or bare Linux with a systemd service.
The shared packaging contract is documented in
`docs/deployment/ATLAS_APP_DISTRIBUTION.md` so the Administration preview,
Docker image, Home Assistant App/Add-on and Linux installer keep one runtime
shape.
Plugin activation state is also stored locally so the demo administration view
survives reloads without turning imported plugins back into a fresh list.
The administration page also stores the selected Card translation module for
future exports. Current choices are the default fallback path, ChatGPT/OpenAI,
Gemini, DeepL API Free, DeepL API Pro and a custom AI provider. The selection is
handed to the Card Editor together with provider-specific key-configured
booleans, but never with raw provider API keys. ChatGPT/OpenAI is the first
connected provider path; the other providers remain planned adapters.
DeepL API planning uses `https://www.deepl.com/de/pro#api` as the reference
for Free/Pro API options.
The prepared DeepL translate endpoint defaults to
`https://api.deepl.com/v2/translate`; request details are tracked at
`https://developers.deepl.com/api-reference/translate/request-translation`.
The DeepL translate endpoint is internal configuration and is not shown as an
Administration input field.
Gemini API-key planning uses `https://ai.google.dev/gemini-api/docs/api-key` as
the key and security reference. Provider API keys are sent to the local
Administration server for the active backend session; they are not stored in the
browser handoff cookie and are not returned to the Card Editor.
After a page reload, the Administration page restores the Home Assistant token
and provider API-key fields from an encrypted long-term Admin cookie. The
browser-held encryption key stays in local Administration storage, so the
cookie does not contain plain provider keys or a plain token. The Admin page can
also refresh secrets from the running local Admin server with
`GET /api/admin-connection?includeSecrets=1`.
The Administration surface can export `atlas-admin-settings.json`; normal
settings are readable, while the Home Assistant token and provider API keys are
stored in an AES-GCM `encryptedSecrets` block. Encrypted secrets are also bound
to the local Atlas Administration installation identity. The Admin server keeps
that identity in local user data outside the repository, or uses
`ATLAS_INSTANCE_ID` when a Docker/server deployment needs an explicit stable
identity. If a server folder or exported settings file is copied to another
installation, Atlas treats the encrypted secrets as invalid.
The Administration provider list links directly to that Gemini API-key
reference next to the Gemini provider row.
ChatGPT/OpenAI is the first connected translation adapter path. The Card Editor
calls the Administration `/api/card-translation` endpoint, and the
Administration server calls the OpenAI Responses API with the configured
server-held key. The default model can be overridden with
`ATLAS_OPENAI_TRANSLATION_MODEL`.
The Administration provider list links to `https://platform.openai.com/api-keys`
next to the ChatGPT/OpenAI provider row.

The connection settings are grouped as an accordion so Home Assistant access,
card translation and parcel service providers stay compact. The parcel provider
section preconfigures public tracking links for DHL, Deutsche Post, Hermes, DPD,
GLS, UPS and FedEx. Amazon Logistics is included as an account-only provider and
is marked for a later authenticated connector instead of pretending that a
public API is available.

Home Assistant tokens are restored by the admin page when the local remember
option is selected or when Save settings is used with a token in the field. The
Card Editor receives the token only through the active Admin handoff or the
local Admin server.
The local Administration server also exposes saved connection settings to the
Card Editor on port `4174`, so reloads and direct editor opens can recover the
handoff after `Save settings`.
When the Auto-connect option is enabled, the editor connects immediately after
receiving the admin handoff.
Plugins receive only approved context such as URLs, WebSocket paths, resource
paths and declared capabilities.
