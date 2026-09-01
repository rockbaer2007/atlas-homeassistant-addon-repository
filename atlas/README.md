# ATLAS Home Assistant App

This is the first Home Assistant App/Add-on packaging scaffold for ATLAS. It
wraps the same runtime used by the standalone Docker preview:

- ATLAS app runtime and health endpoint on port `4176`
- ATLAS Administration on port `4175`
- Home Assistant Card Editor reference plugin on port `4174`

Home Assistant Ingress is enabled for the ATLAS app port. ATLAS opens the only
active plugin directly or shows the Plugin Hub when multiple plugins are active.

Prepare a local test copy from the repository root:

```sh
pnpm ha:app:prepare
```

Copy `output/home-assistant-app/atlas` into the Home Assistant `/addons`
directory for local app testing, then refresh the App/Add-on store.

The package Dockerfile mirrors the verified standalone container path. For a
local smoke test, build the prepared app folder and check the runtime health
endpoint:

```sh
docker build -t atlas-home-assistant-app:local output/home-assistant-app/atlas
docker run --rm -p 4176:4176 -p 4175:4175 -p 4174:4174 atlas-home-assistant-app:local
```

Then open `http://127.0.0.1:4176/health` and confirm that Administration and
the Card Editor are ready.

## Home Assistant sidebar dashboard

The preferred Add-on path is **Settings -> Add-ons -> ATLAS -> Show in
sidebar**. This opens ATLAS through Home Assistant Ingress and lets ATLAS decide
whether to open the only active plugin directly or show the Plugin Hub.

To embed the editor like other local web tools instead, create a Home Assistant
**Webpage** dashboard:

1. Open **Settings -> Dashboards**.
2. Select **Add dashboard**.
3. Choose **Webpage**.
4. Name it `ATLAS`.
5. Use the app URL, for example `http://<home-assistant-host>:4176/`.
6. Enable **Show in sidebar** and save.

ATLAS opens inside Home Assistant. With one active plugin the editor opens
directly; with multiple active plugins the Plugin Hub appears. Administration
stays available from the editor link, while Home Assistant tokens and provider
API keys stay in ATLAS Administration or the Add-on options.

## Add-on connection options

The Add-on configuration can provide the Home Assistant URL, a long-lived
access token, whether ATLAS Administration should import that token on startup
and whether the Card Editor should auto-connect after the handoff. The token is
shown as text because Home Assistant can mask local password fields on reload
and pass only a shortened placeholder to the Add-on. The token is not stored
permanently by the Card Editor.
