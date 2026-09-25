# ATLAS Terminal

An ATLAS plugin that provides an xterm.js browser terminal with ANSI colors, adjustable font size, optional server-configured SSH and selectable Oh My Posh themes from the maintained [UGSo theme fork](https://github.com/rockbaer2007/oh-my-posh). The Home Assistant SSH add-on is a functional reference; no code from it is bundled.

## Enable access

The terminal is disabled unless `ATLAS_TERMINAL_ENABLED=1` and a random access token of at least 32 URL-safe characters is configured on the ATLAS server. Generate one with `openssl rand -base64 32 | tr '+/' '-_' | tr -d '='` and provide it through the server environment as `ATLAS_TERMINAL_TOKEN`. The plugin stores the token in this browser's local storage for reuse, with a control to forget it. It is sent to the server only when connecting, in the WebSocket subprotocol and never in a URL. Anyone who can run scripts on the same browser origin could access local storage, so use the plugin only in a trusted browser profile. Use **Back to Hub** in the toolbar to return to the ATLAS Plugin Hub.

The shell runs with the same operating-system permissions as the ATLAS server process. Do not expose the server to an untrusted network. In Docker, treat enabling the terminal as granting shell access inside the container and to any mounted paths.

## Install additional commands in the Home Assistant add-on

In the ATLAS add-on configuration, add Alpine package names to `packages`, for example `mc`. Save the options and restart the add-on; its startup installs the listed packages in the terminal container, so `mc` is then available in the local terminal. Package names are restricted to safe Alpine package-name characters. This does not install commands on an SSH target or on the Home Assistant host. Standalone Docker deployments need the package installed in their image separately.

## Optional Home Assistant SSH target

Configure `ATLAS_TERMINAL_SSH_HOST`, `ATLAS_TERMINAL_SSH_USER`, `ATLAS_TERMINAL_SSH_IDENTITY_FILE` and `ATLAS_TERMINAL_SSH_KNOWN_HOSTS` on the server to show the SSH target. Both the private key and known-hosts file must exist. Optionally set `ATLAS_TERMINAL_SSH_PORT` (default `22`). Host key verification is always enabled. Password login and arbitrary SSH destinations are not accepted from the browser.

For Docker, mount the SSH key and `known_hosts` read-only into the container before enabling SSH. Add the terminal variables to the Compose environment or a protected `.env` file; never commit tokens or private keys.

## UI settings

Switch the interface between German and English. Use the slider to set a font size from 11 to 26 px; the choice is saved locally in the browser. The terminal loads `MesloLGM Nerd Font Mono` from Home Assistant's `/local/fonts/` path (or `/local/`) and falls back to other monospace fonts if the files are unavailable. When the ATLAS host has Oh My Posh and Bash installed, select a theme from the dropdown for local terminal sessions. The theme list comes from the UGSo fork and the selection is saved in this browser. SSH sessions use the remote server's own shell and do not apply a local theme. ANSI colors are rendered by xterm.js.
