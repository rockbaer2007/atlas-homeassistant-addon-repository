# ATLAS Framework

## ATLAS Terminal plugin

The optional [ATLAS Terminal plugin](https://github.com/rockbaer2007/atlas-terminal-plugin)
provides an ANSI-colored browser terminal with adjustable font size, optional
server-configured SSH, and selectable Oh My Posh themes for local Bash sessions.
It loads `MesloLGMNerdFontMono-Regular.ttf` and
`MesloLGMNerdFontMono-Bold.ttf` from Home Assistant `/local/fonts/` (or `/local/`),
so clients do not need a local font installation. Place them in `/config/www/fonts/`
or directly in `/config/www/`. The terminal is disabled by default. See
[`atlas-plugins/terminal/README.md`](atlas-plugins/terminal/README.md) for setup
and security requirements.

ATLAS is a modular TypeScript framework focused on stable architecture,
explicit contracts and long-term maintainability.

Current focus:

**Home Assistant App/Add-on and Plugins**

ATLAS ships Administration, Plugin Hub and the Home Assistant Card Editor as its
built-in reference plugin. File Studio, Terminal, Automation Exporter / Editor
and other independently maintained plugins are installed and updated through
their own repositories. The current Home Assistant App/Add-on package is
`0.1.259`.

Administration and Plugin Hub now include French text for every current
interface message key. Plugin-provided names and descriptions may use another
available language when no French version is provided.

File Studio displays its active filesystem permissions in a compact, regular-weight
notice. Each approved path has its own color so paths such as `/config/www`,
`/addons` and `/parent-of-config` are easy to distinguish.
It can preview ZIP, TAR, TAR.GZ and TGZ archives, extract supported content
safely, or extract one selected file without unpacking the rest.

The Plugin Hub opens one active plugin directly, shows a selection when several
plugins are active and keeps capability plus sidebar URL details collapsed by
default. Card Editor, Administration and plugin asset URLs can run through the
ATLAS app route so Home Assistant Ingress and remote browsers do not have to
reach the separate local development ports directly.

### Home Assistant sidebar links for plugins

Starting with App/Add-on `0.1.236`, the sidebar helper generates a stable
plugin launch URL on port `4176`, for example
`http://<ATLAS_HOST>:4176/launch/atlas.plugin.file-studio`. If you already added
a plugin to the Home Assistant sidebar, reopen the sidebar dialog in ATLAS,
copy the newly offered **URL**, and replace the old `url` in that plugin's
`panel_iframe` configuration. Alternatively, copy and replace the complete
YAML block. Restart Home Assistant to reload the sidebar configuration. The
Home Assistant sidebar path itself does not change; the app's port `4176` must
be reachable by the browser displaying Home Assistant.

ATLAS Automation Exporter / Editor is available as a GitHub-installable plugin
at version `0.1.5`. It can analyze `/config/automations.yaml` or uploaded YAML,
show highlighted automation details, detect modern `action:` service calls and
export selected automations with timestamped filenames.

---

# Documentation

* `ATLAS.md` - project identity and principles
* `ROADMAP.md` - strategic roadmap
* `SPRINTS.md` - sprint overview
* `SNAPSHOTS.md` - release snapshot overview
* `docs/project/STABILIZATION_REVIEW.md` - G2.5 stabilization review
* `CONTRIBUTING.md` - contribution process
* `SECURITY.md` - security policy
* `docs/adr` - architecture decision records
* `docs/project` - project specifications

---

# Development

Install dependencies:

```sh
pnpm install
```

Run quality gates:

```sh
pnpm check
pnpm build
pnpm test
```

Run the combined local app preview:

```sh
pnpm build
pnpm start:app
```

Open:

* App status: `http://127.0.0.1:4176/app`
* App health: `http://127.0.0.1:4176/health`
* Administration: `http://127.0.0.1:4175/`
* Home Assistant Card Editor: `http://127.0.0.1:4174/`
* Plugin Hub and installed plugin routing: `http://127.0.0.1:4176/`

Build and run the standalone Docker preview:

```sh
pnpm docker:build
pnpm docker:up
```

The container binds the app surfaces through `ATLAS_HOST=0.0.0.0` and exposes
ports `4176`, `4175` and `4174`. Set `ATLAS_INSTANCE_ID` when a server,
Docker host or later Home Assistant App/Add-on package needs a deliberate
stable Administration identity.

The packaged-app distribution path is documented in
[`docs/deployment/ATLAS_APP_DISTRIBUTION.md`](docs/deployment/ATLAS_APP_DISTRIBUTION.md).
It keeps standalone Docker first, then derives the Home Assistant App/Add-on
and Linux VM/LXC installer from the same runtime contract.

---

## License

MIT License. See [LICENSE](LICENSE).

---

© ATLAS Framework
