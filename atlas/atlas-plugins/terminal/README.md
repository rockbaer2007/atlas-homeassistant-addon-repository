# ATLAS Terminal

An ATLAS plugin that provides an xterm.js browser terminal with ANSI colors, adjustable font size and an optional server-configured SSH target. Its segmented ANSI shell prompt takes visual inspiration from Oh My Posh. The Home Assistant SSH add-on is a functional reference; no code from either project is bundled.

## Enable access

The terminal is disabled unless `ATLAS_TERMINAL_ENABLED=1` and a random access token of at least 32 URL-safe characters is configured on the ATLAS server. Generate one with `openssl rand -base64 32 | tr '+/' '-_' | tr -d '='` and provide it through the server environment as `ATLAS_TERMINAL_TOKEN`. The plugin stores the token in this browser's local storage for reuse, with a control to forget it. It is sent to the server only when connecting, in the WebSocket subprotocol and never in a URL. Anyone who can run scripts on the same browser origin could access local storage, so use the plugin only in a trusted browser profile.

The shell runs with the same operating-system permissions as the ATLAS server process. Do not expose the server to an untrusted network. In Docker, treat enabling the terminal as granting shell access inside the container and to any mounted paths.

## Optional Home Assistant SSH target

Configure `ATLAS_TERMINAL_SSH_HOST`, `ATLAS_TERMINAL_SSH_USER`, `ATLAS_TERMINAL_SSH_IDENTITY_FILE` and `ATLAS_TERMINAL_SSH_KNOWN_HOSTS` on the server to show the SSH target. Both the private key and known-hosts file must exist. Optionally set `ATLAS_TERMINAL_SSH_PORT` (default `22`). Host key verification is always enabled. Password login and arbitrary SSH destinations are not accepted from the browser.

For Docker, mount the SSH key and `known_hosts` read-only into the container before enabling SSH. Add the terminal variables to the Compose environment or a protected `.env` file; never commit tokens or private keys.

## UI settings

Switch the interface between German and English. Use the slider to set a font size from 11 to 26 px; the choice is saved locally in the browser. ANSI colors are rendered by xterm.js, and the shell prompt uses colored path/status segments when the configured shell supports them.
