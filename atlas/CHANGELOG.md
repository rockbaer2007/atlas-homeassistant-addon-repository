# Changelog

## 0.1.123

- Add Automation Exporter / Editor analysis hints for missing ids, missing
  aliases, duplicate ids or aliases, missing triggers/actions and disabled
  automations.
- Add a "warnings only" filter and warnings summary count.
- Bump the bundled Automation Exporter / Editor plugin to `0.1.2`.

## 0.1.122

- Make Plugin Hub capability lists collapsible by default on every plugin card.
- Keep plugin cards more compact while preserving full capability details on
  demand.

## 0.1.121

- Align the bundled ATLAS Automation Exporter / Editor with the installable
  GitHub plugin package `0.1.1`.
- Keep the Home Assistant Add-on update target moving after the plugin install
  package fix.

## 0.1.120

- Add the ATLAS Automation Exporter / Editor as the next Home Assistant plugin.
- Provide a first safe automation analysis surface with system YAML loading,
  external YAML upload, selectable exports and File Studio handoff.
- Add a dedicated ATLAS overlay icon and plugin preview.

## 0.1.119

- Lighten the Expert Card Editor X/Y/Zoom slider text in dark mode.
- Bump the Home Assistant Card Editor plugin to `0.2.0-alpha.47`.

## 0.1.118

- Change the Expert Card Editor Zoom slider to 5-percent steps from `75%` to
  `150%`.
- Bump the Home Assistant Card Editor plugin to `0.2.0-alpha.46`.

## 0.1.117

- Set the Expert Card Editor Zoom slider to roughly one and a half times the
  compact X/Y slider width.
- Bump the Home Assistant Card Editor plugin to `0.2.0-alpha.45`.

## 0.1.116

- Make the Expert Card Editor Zoom slider use a compact percent range.
- Change the Zoom slider range to `74%` through `150%`.
- Bump the Home Assistant Card Editor plugin to `0.2.0-alpha.44`.

## 0.1.115

- Move the Expert Card Editor X, Y and Zoom sliders into a compact toolbar above
  the editor grid.
- Show X and Y as additional fields from `0` to `+5` and Zoom as a percentage.
- Start the "Entities for the card" panel collapsed by default.
- Bump the Home Assistant Card Editor plugin to `0.2.0-alpha.43`.

## 0.1.114

- Render Expert Card Editor raster cells explicitly so the horizontal and
  vertical sliders visibly add real fields instead of stretching the grid.
- Re-render the Expert Card Editor surface after zoom changes so cell geometry
  stays consistent.
- Bump the Home Assistant Card Editor plugin to `0.2.0-alpha.42`.

## 0.1.113

- Stop reporting Plugin Hub URL/YAML copy success when the browser blocks direct
  clipboard writes.
- Show and select the URL/YAML text inline so users can copy it manually with
  Ctrl+C in restricted Home Assistant browser contexts.

## 0.1.112

- Make the Card Editor export and import/entity areas visibly three-column with
  equal-width column panels on wide screens.
- Bump the Home Assistant Card Editor plugin to `0.2.0-alpha.41`.

## 0.1.111

- Make the Plugin Hub URL/YAML copy fallback work in browser contexts where the
  Clipboard API is blocked.
- Show a clear copy failure message instead of failing silently.

## 0.1.110

- Arrange the Card Editor export controls in three side-by-side columns on wide
  screens.
- Arrange import, entity filtering and entity selection in three side-by-side
  columns with a responsive single-column fallback.
- Bump the Home Assistant Card Editor plugin to `0.2.0-alpha.40`.

## 0.1.109

- Fix the Expert Card Editor raster sliders so extra columns and rows render as
  real grid cells with stable cell geometry.
- Bump the Home Assistant Card Editor plugin to `0.2.0-alpha.39`.

## 0.1.108

- Give local ATLAS plugins an automatic launch URL when their plugin folder
  contains an `index.html` but the manifest does not define `entry`.
- Include the automatic plugin URL in the app plugin catalog so users can add
  plugins to the Home Assistant sidebar from the start.

## 0.1.107

- Add spacing between the File Studio tree and the access note.
- Reduce the File Studio access note text size slightly.

## 0.1.106

- Add an Expert Card Editor zoom slider that scales square grid cells evenly.
- Keep column and row sliders dedicated to field count only.
- Reposition the vertical grid slider so it sits beside the editor surface.

## 0.1.105

- Replace the Expert Card Editor surface stretch handle with horizontal and
  vertical grid sliders.
- Keep Expert editor grid cells square while increasing or reducing the
  available column and row count.

## 0.1.104

- Add a separate "Copy URL" action to the Plugin Hub sidebar helper for users
  who create Home Assistant Webpage dashboards manually.

## 0.1.103

- Move the Home Assistant sidebar helper dialog into the Plugin Hub.
- Remove the visible Administration button for sidebar preparation.
- Always provide an ATLAS File Studio fallback URL for sidebar YAML.

## 0.1.102

- Open the plugin sidebar helper dialog directly from the Plugin Hub.
- Add ready-to-copy `panel_iframe` YAML blocks for plugin sidebar entries.
- Fix ATLAS File Studio sidebar preparation by showing its direct plugin URL.

## 0.1.101

- Add a Plugin Hub hint for adding plugins to the Home Assistant sidebar as
  Webpage dashboards.
- Show direct sidebar URLs for launchable plugins, including ATLAS File Studio.

## 0.1.100

- Add an Atlas Administration dialog that lists current plugins and prepares
  Home Assistant Webpage dashboard/sidebar entries with name, URL and icon.

## 0.1.99

- Keep the File Studio editor pane fixed-height for large files so the editor
  scrolls internally and status texts remain visible.
- Bump ATLAS File Studio to `0.1.36` for repository update detection.

## 0.1.98

- Mark parcel service providers in Atlas Administration as prepared for later
  use with an orange note.

## 0.1.97

- Add explicit File Studio path capability switches for `/config/www`,
  `/config/custom_components`, `/addons` and `parent-of-config`.
- Keep Home Assistant tokens Admin-owned while plugins receive scoped file
  capabilities only.
- Finalize Plugin Hub behavior for zero, one and multiple active plugins.
- Align the Plugin Hub action color with the ATLAS teal/orange UI language.
- Document the Home Assistant update flow and the meaning of old/target
  version labels.
- Bump ATLAS File Studio to `0.1.35` for repository update detection.

## 0.1.96

- Add a dedicated SVG trash icon for File Studio.
- Move the File Studio trash control to the far right of the editor toolbar
  behind a separator.
- Show the trash icon gray when empty and red when entries exist.
- Bump ATLAS File Studio to `0.1.34` for repository update detection.

## 0.1.95

- Move File Studio delete operations into a restorable ATLAS trash area.
- Add File Studio favorites for quick path access and a compact favorite toggle.
- Expand Home Assistant YAML hints for common root keys, automations, scripts
  and direct secret values.
- Refine File Studio file-type icons with compact type badges.
- Bump ATLAS File Studio to `0.1.33` for repository update detection.

## 0.1.94

- Add File Studio in-app dialogs for prompts, confirmations, history and
  problem-report previews.
- Add multi-select delete/copy/move actions, drag-and-drop uploads, search
  filters and backup comparison.
- Bump ATLAS File Studio to `0.1.32` for repository update detection.

## 0.1.93

- Move the File Studio Dateibaum icon toolbar below the `Dateibaum /config`
  title row so narrow panes no longer push icons into the next column.
- Bump ATLAS File Studio to `0.1.31` for repository update detection.

## 0.1.92

- Add File Studio restore from history with a safety backup before restoring.
- Add GitHub issue preparation for secret-free File Studio problem reports.
- Expand Home Assistant YAML hints for automations, scripts, packages and
  `configuration.yaml`.
- Bump ATLAS File Studio to `0.1.30` for repository update detection.

## 0.1.91

- Add File Studio diagnostics with opt-in debug report preview.
- Add HA-oriented YAML/reload hints, automatic save backups, history listing,
  richer search previews and conflict-aware upload/download naming.
- Bump ATLAS File Studio to `0.1.29` for repository update detection.

## 0.1.90

- Increase File Studio icon buttons to `32x32` for better readability.
- Bump ATLAS File Studio to `0.1.28` for repository update detection.

## 0.1.89

- Clean up the File Studio toolbar with left-aligned icon buttons and
  right-aligned text buttons.
- Add Word-wrap, Upload/Replace, Undo and Redo icon controls.
- Bump ATLAS File Studio to `0.1.27` for repository update detection.

## 0.1.88

- Add automatic read-only plugin update checks in Atlas Administration after
  app start or reload.

## 0.1.87

- Update the File Studio toolbar so the font-size controls are adjacent
  Color-icon buttons and the word-wrap control follows as a text button.
- Bump ATLAS File Studio to `0.1.26` for repository update detection.

## 0.1.86

- Add File Studio icon-button actions for rename, delete, copy, move, search,
  archive extraction and optional hidden-file display.
- Bump ATLAS File Studio to `0.1.25` for repository update detection.

## 0.1.85

- Publish the prepared ATLAS Add-on layout directly at the GitHub repository
  root so Home Assistant can detect updates from the repository URL.

## 0.1.84

- Add the File Studio PNG icon button update to the Home Assistant package so
  Home Assistant detects a new Add-on version.
- Bump ATLAS File Studio to `0.1.24` for repository update detection.

## 0.1.83

- Move Add-on connection details to the top of the README, remove the
  installation/local-test/sidebar blocks and keep the matching English
  reference text below a separator.

## 0.1.82

- Replace the Add-on repository README with a German installation-focused
  description and keep local smoke-test details in the ATLAS source repository.

## 0.1.81

- Show the Home Assistant token option as a masked password field in the native
  Home Assistant Add-on configuration UI.

## 0.1.80

- Fix File Studio A-/A+ editor font-size controls so they apply immediately and
  persist the selected size correctly.
- Bump ATLAS File Studio to `0.1.22` for repository update detection.

## 0.1.79

- Add File Studio image zoom controls for zooming out, returning to 100% and
  zooming in while keeping image proportions intact.
- Add a File Studio ZIP preview modal that lists archive contents without
  extracting files.
- Add a binary File Studio download route so previewed images and ZIP archives
  download without passing through the text editor.
- Bump ATLAS File Studio to `0.1.21` for repository update detection.

## 0.1.78

- Let File Studio image previews auto-size to the opened image while keeping
  the modal inside the `40vw`/`40vh` to `80vw`/`80vh` resize bounds.
- Keep small images at their natural size and shrink oversized images
  proportionally instead of stretching them into the preview area.
- Bump ATLAS File Studio to `0.1.20` for repository update detection.

## 0.1.77

- Adjust File Studio image preview sizing to start at `70vw` by `70vh`, with
  resize limits from `40vw`/`40vh` up to `80vw`/`80vh`.
- Fit SVG and other image previews into the full preview stage to avoid clipped
  lower edges.
- Bump ATLAS File Studio to `0.1.19` for repository update detection.

## 0.1.76

- Make the File Studio image preview modal resizable with the same diagonal
  resize handle style used by the Card Editor.
- Start image previews at `75vw` by `70vh`, allow resizing from 30% smaller to
  15% larger, remember the chosen size and reset it by double-clicking the
  handle.
- Bump ATLAS File Studio to `0.1.18` for repository update detection.

## 0.1.75

- Move File Studio image previews into a modal overlay so selecting images no
  longer changes the editor layout height.
- Keep image download available from the preview modal and the editor toolbar.
- Bump ATLAS File Studio to `0.1.17` for repository update detection.

## 0.1.74

- Add File Studio image previews for PNG, JPG/JPEG, SVG, GIF, WebP, BMP and ICO
  files without loading them through the text editor.
- Serve File Studio image assets through the same scoped `/config` and optional
  `/addons` access policy as the file tree.
- Bump ATLAS File Studio to `0.1.16` for repository update detection.

## 0.1.73

- Add a Home Assistant App/Add-on option to explicitly allow File Studio access
  to `/addons`.
- Keep the `/addons` approval read-only in Administration when ATLAS runs as a
  Home Assistant App/Add-on, while standalone/Docker mode can manage it in
  Administration.
- Let File Studio show `/addons` next to `/config` only when the effective
  approval is active.
- Bump ATLAS File Studio to `0.1.15` for repository update detection.

## 0.1.72

- Add a bundled CodeMirror 6 editor for ATLAS File Studio with line numbers,
  active-line highlighting, search keybindings and syntax highlighting for YAML,
  JSON, JavaScript/TypeScript and Markdown.
- Keep the editor bundle local to the ATLAS package instead of loading editor
  code from a CDN.
- Bump ATLAS File Studio to `0.1.14` for repository update detection.

## 0.1.71

- Add File Studio tree action icon buttons for creating files, creating folders,
  refreshing the tree and collapsing folders.
- Add inline file and folder creation with Enter/Escape handling and scoped name
  validation.
- Add editable File Studio content loading, saving, save-as, discard, download,
  upload/replace, word-wrap and font-size controls.
- Add scoped File Studio API endpoints for reading, writing, creating and basic
  YAML validation under `/config`.
- Bump ATLAS File Studio to `0.1.13` for repository update detection.

## 0.1.70

- Add a File Studio header toggle for limiting the workspace width to 1900px or
  using the full browser width for large files.
- Bump ATLAS File Studio to `0.1.12` for repository update detection.

## 0.1.69

- Add a File Studio header toggle for limiting the workspace height to 1024px.
- Use a shared dynamic workspace height so the file tree, folder list and editor
  expand together based on the available screen height.
- Bump ATLAS File Studio to `0.1.11` for repository update detection.

## 0.1.68

- Extend the ATLAS File Studio workspace vertically so the editor and file panes
  use more of the available screen height.
- Bump ATLAS File Studio to `0.1.10` for repository update detection.

## 0.1.67

- Rename the Add-on description to ATLAS Administration and Home Assistant
  Plugins preview.
- Add compact type-aware ATLAS File Studio icons for YAML, JSON, code,
  Markdown, text and archive files without extra labels in the left tree.
- Bump ATLAS File Studio to `0.1.9` and Atlas Framework package metadata to
  `0.2.0-alpha.30` for the update package.

## 0.1.66

- Deduplicate repository preview plugins in ATLAS Administration by plugin ID
  so File Studio only appears once when multiple repositories provide it.
- Label bundled plugins as built in instead of showing a disabled install
  action in repository previews.
- Bump Atlas Framework package metadata to `0.2.0-alpha.29` for the update
  package.

## 0.1.65

- Remove remaining file type labels from the ATLAS File Studio left directory
  tree so the pane only shows compact icons and names.
- Fix the CSS folder and file icons so they render reliably in the Home
  Assistant webview.
- Bump ATLAS File Studio to `0.1.8` and Atlas Framework package metadata to
  `0.2.0-alpha.28` for the update package.

## 0.1.64

- Make the ATLAS File Studio tree more compact by replacing directory/type text
  with color-coded folder and file icons.
- Widen the Home Assistant Card Editor surface to match the File Studio
  workspace width.
- Hide planned non-launchable placeholder plugins from the Plugin Hub.
- Bump ATLAS File Studio to `0.1.7` and Atlas Framework package metadata to
  `0.2.0-alpha.27` for the update package.

## 0.1.63

- Deduplicate bundled plugins in ATLAS Administration so the Card Editor and
  other built-in plugins are only listed once even when an older imported copy
  exists in local browser storage.
- Bump Atlas Framework package metadata to `0.2.0-alpha.26` for the update
  package.

## 0.1.62

- Rework ATLAS File Studio into a flexible split layout with a resizable
  directory tree, a folder file list and a larger editor pane.
- Show short tree names while the folder list displays the selected directory
  contents with size and modified date metadata.
- Bump ATLAS File Studio to `0.1.6` and Atlas Framework package metadata to
  `0.2.0-alpha.25` for the update package.

## 0.1.61

- Load the ATLAS File Studio sidebar as a real directory tree from the scoped
  Home Assistant `/config` path.
- Map the Home Assistant `config` folder into the Add-on so the tree can show
  the real `/config` directory during testing.
- Keep the File Studio tree read-only for this increment and show clear
  availability status when `/config` is not reachable.
- Bump ATLAS File Studio to `0.1.5` and Atlas Framework package metadata to
  `0.2.0-alpha.24` for the update package.

## 0.1.60

- Add the ATLAS overlay badge to the ATLAS File Studio plugin icon.
- Bump ATLAS File Studio to `0.1.4` and Atlas Framework package metadata to
  `0.2.0-alpha.23` for the update package.

## 0.1.59

- Make the ATLAS File Studio shell wider and give the editor area more vertical
  room on desktop screens.
- Normalize Plugin Hub icon, logo and preview URLs for Home Assistant Ingress so
  local plugin images keep rendering.
- Bump ATLAS File Studio to `0.1.3` and Atlas Framework package metadata to
  `0.2.0-alpha.22` for the update package.

## 0.1.58

- Align ATLAS File Studio with the Card Editor light and dark theme colors.
- Load File Studio assets and Hub navigation through relative paths for Home
  Assistant Ingress compatibility.
- Bump ATLAS File Studio to `0.1.2` and Atlas Framework package metadata to
  `0.2.0-alpha.21` for the update package.

## 0.1.57

- Make Plugin Hub asset, API and navigation links work from Home Assistant
  Ingress paths instead of only from the app server root.
- Add route fallbacks for prefixed Ingress paths so Hub styling and Admin
  navigation do not resolve against the Home Assistant frontend.
- Bump Atlas Framework package metadata to `0.2.0-alpha.20` for the update
  package.

## 0.1.56

- Bridge repository-installed ATLAS plugins from Administration into the app
  Plugin Hub catalog.
- Preserve repository plugin launch entries so external plugins can appear and
  open from the Hub after Admin synchronization.
- Bump Atlas Framework package metadata to `0.2.0-alpha.19` for the update
  package.

## 0.1.55

- Add ATLAS File Studio as the second independent plugin line.
- Register File Studio in Administration and the Plugin Hub with scoped file
  access metadata for `/config` and Admin-approved `/addons`.
- Add a File Studio plugin start surface for testing the Hub launch path.
- Bump Atlas Framework package metadata to `0.2.0-alpha.18` for the update
  package.

## 0.1.54

- Brighten Editor and Administration placeholder text in dark mode.
- Bump Atlas Framework package metadata to `0.2.0-alpha.17` for the update
  package.

## 0.1.53

- Make the Card Editor Home Assistant connection details collapsible.
- Keep Administration and Plugin Hub navigation visible as buttons outside the
  connection details block.
- Open the connection details automatically when the editor is not connected,
  the token is missing or the connection fails.
- Bump Atlas Framework package metadata to `0.2.0-alpha.16` for the update
  package.

## 0.1.52

- Describe the GitHub repository install path first in the Add-on README.
- Keep local package preparation under development notes instead of presenting
  it as the normal install path.
- Bump Atlas Framework package metadata to `0.2.0-alpha.15` for the update
  package.

## 0.1.51

- Load external plugin repositories and plugin packages without custom request
  headers so GitHub Raw works in browser CORS mode.
- Bump Atlas Framework package metadata to `0.2.0-alpha.14` for the update
  package.

## 0.1.50

- Normalize saved GitHub plugin repository URLs during Administration refresh,
  so existing entries reload from `repository.json`.
- Use a trash icon for repository removal instead of a plain `x`.
- Bump Atlas Framework package metadata to `0.2.0-alpha.13` for the update
  package.

## 0.1.49

- Add a direct Plugin Hub link below the Atlas Administration link in the Card
  Editor.
- Use proper German umlauts in visible Administration, Card Editor and Plugin
  Hub labels, hints and status messages.
- Bump Atlas Framework package metadata to `0.2.0-alpha.12` for the update
  package.

## 0.1.48

- Require explicit ATLAS plugin repository markers before a custom repository
  can be previewed or saved in Administration.
- Require explicit ATLAS plugin markers on repository plugin entries so Home
  Assistant add-on repositories and unrelated JSON feeds are rejected.
- Bump Atlas Framework package metadata to `0.2.0-alpha.11` for the update
  package.

## 0.1.47

- Prevent Atlas Administration from accepting Home Assistant add-on repositories
  as ATLAS plugin repositories.
- Resolve valid GitHub ATLAS plugin repository homepages to their
  `repository.json` before storing them.
- Bump Atlas Framework package metadata to `0.2.0-alpha.10` for the update
  package.

## 0.1.46

- Brighten Card Editor dark-mode status lines for entity loading and translation
  module state when installed through the Home Assistant add-on.
- Use the same brighter link accent for transparent dark-mode buttons so
  secondary actions remain readable on dark backgrounds.
- Bump Atlas Framework package metadata to `0.2.0-alpha.9` for the update
  package.

## 0.1.45

- Improve Card Editor dark-mode contrast for the header subtitle, Card export
  language labels and translation controls.
- Use theme-aware checkbox accent colors so selected export languages remain
  visible when installed through the GitHub add-on repository.
- Bump Atlas Framework package metadata to `0.2.0-alpha.8` for the update
  package.

## 0.1.43

- Add localized plugin metadata fields for names and descriptions.
- Show translated plugin names and descriptions in Atlas Administration and the
  Plugin Hub based on the selected UI language, with English/string fallback.
- Bump Atlas Framework package metadata to `0.2.0-alpha.7` for the update
  package.

## 0.1.42

- Remove the direct Card Editor header link from the Plugin Hub.
- Keep Card Editor Expert/editor panels on the shared dark Administration
  palette instead of switching them back to light panel colors.
- Improve dark-mode contrast for language and theme toggles in the Card Editor
  and Plugin Hub.
- Bump Atlas Framework package metadata to `0.2.0-alpha.6` for the update
  package.

## 0.1.41

- Remove the Home Assistant handoff action from custom repository rows in Atlas
  Administration.
- Bump Atlas Framework package metadata to `0.2.0-alpha.5` for the update
  package.

## 0.1.40

- Align the Card Editor and Plugin Hub dark theme palette with Atlas
  Administration for darker backgrounds, panels, borders and accent contrast.
- Bump Atlas Framework package metadata to `0.2.0-alpha.4` for the update
  package.

## 0.1.39

- Show repository plugins with separate available and installed version labels
  in Atlas Administration.
- Refresh repository and plugin package requests without browser-cache reuse so
  plugin updates appear reliably in the Administration dialog.
- Remove the Home Assistant handoff action from ATLAS plugin cards.

## 0.1.38

- Brighten dark theme text colors across Administration, Card Editor and Plugin
  Hub surfaces.
- Preserve the selected theme when navigating through the local demo and test
  links.
- Bump Atlas Framework package metadata to `0.2.0-alpha.2` for the update
  package.

## 0.1.37

- Add a tested My Home Assistant add-on repository deep link for repository
  URLs.
- Show an "Open in Home Assistant" action next to Administration repository
  entries and repository plugin install actions.
- Strip credentials, fragments and sensitive query parameters before building
  repository deep links.

## 0.1.36

- Add DE/EN language selection to the Plugin Hub.
- Reduce Plugin Hub plugin imagery to one smaller image per plugin card.
- Remove the duplicate preview/logo rendering from current Plugin Hub cards.

## 0.1.35

- Move the Card Editor problem report sanitizer, preview text and GitHub issue
  URL generation into the shared Home Assistant package.
- Add tests that verify token, authorization header, cookie, localStorage and
  provider API key redaction before debug reports are copied or opened.

## 0.1.34

- Widen the Administration App-Freigabe output-goals column so release target
  descriptions have enough room beside the checks list.
- Pin the Ausgabeziele card grid areas so the status badge stays to the right
  and the description spans the full target card width.

## 0.1.33

- Fix the Administration release target layout so output goal descriptions use
  the available card width instead of wrapping as one word per line.
- Keep the layout adjustment scoped to the Ausgabeziele/distribution target
  list while other readiness lists retain their compact row layout.

## 0.1.32

- Add `logo` as a first-class plugin asset alongside icon and preview.
- Show ATLAS-branded plugin logos in Administration and Plugin Hub surfaces.
- Refresh the built-in Card Editor and Simple Editor plugin icons with
  function-specific ATLAS overlays.
- Document the plugin icon, logo and preview asset convention in the roadmap
  and repository format specification.

## 0.1.31

- Add the first ATLAS plugin repository format specification.
- Show repository plugin icon, preview and compatibility metadata in the
  Administration repository preview.
- Serve SVG assets with an explicit content type in the Administration demo
  server.

## 0.1.30

- Darken the ATLAS repository button styling so it is visually distinct from
  Home Assistant/HACS buttons while keeping the app icon visible.

## 0.1.29

- Fix the ATLAS repository button icon path for Home Assistant/Ingress usage.

## 0.1.28

- Replace long detected entity summary text with compact status chips in the
  Card Editor.
- Hide long selected entity and attention lists from the upper entity summary
  while keeping the detailed entity table available below.

## 0.1.27

- Use the real ATLAS app icon in the Administration repository button.
- Serve PNG assets with an explicit `image/png` content type in the
  Administration demo server.

## 0.1.26

- Add an ATLAS-branded repository button with teal, cyan and orange accents in
  the Administration plugin area.
- Keep the button wired to the existing custom repository dialog.

## 0.1.25

- Install ATLAS repository plugins from package or manifest URLs into the
  persisted Administration plugin state.
- Add repository update detection per plugin and enable Install, Update and
  Remove actions in the Administration repository preview.

## 0.1.24

- Limit the detected Home Assistant entities table height to roughly ten rows
  with an internal scrollbar.
- Keep the detected entity table header visible while scrolling.

## 0.1.23

- Add a compact entity overview table inside the "Entities for the card"
  collapsible section.
- Keep the lower detected Home Assistant entities table separate with sorting.

## 0.1.22

- Keep the detected Home Assistant entities table collapsed by default in both
  Simple and Expert mode.

## 0.1.21

- Use ATLAS example entities as a Simple card export fallback when no entities
  are selected.
- Keep the editor input unchanged and show an export status hint when fallback
  entities are inserted.

## 0.1.20

- Add sortable table headers to the detected Home Assistant entities table.
- Sort detected entities by type/source and then entity by default.
- Allow toggling ascending and descending order for entity, state and
  type/source columns.

## 0.1.19

- Rename the entity picker section to "Entities for the card" / "Entitaeten
  fuer die Card".
- Rename the lower entity list to "Entities detected in HA" / "In HA erkannte
  Entitaeten".
- Show detected Home Assistant entities as a compact table with a separate
  action column.

## 0.1.18

- Tune the Expert card-list favorite checkbox in dark mode with a green field
  and light ATLAS green check color.

## 0.1.17

- Tune the Card Editor Expert dark theme so the card list, selected entities
  and editor grid use a light grey working surface.
- Style Expert mode dropdowns and action buttons with ATLAS green and neutral
  dark controls.

## 0.1.16

- Add the Home Assistant App/Add-on `editor_start_mode` option for Simple or
  Expert Card Editor startup.
- Pass the selected editor start mode from the Home Assistant options through
  Administration into the Card Editor handoff and saved connection settings.
- Improve Card Editor dark theme styling for controls, resource hints, entity
  selection and Home Assistant card preview surfaces.

## 0.1.15

- Rename the Administration launch button from Card Editor to Plugin Hub.
- Open the Plugin Hub from Administration in the same browser surface.
- Treat Home Assistant App/Add-on connection values as option-managed and show
  the Home Assistant URL, token and connection checkboxes as read-only controls.

## 0.1.14

- Add the shared ATLAS light/dark/auto theme switch to the Card Editor.
- Persist the Card Editor theme choice through the same `atlas.themePreference`
  key used by Administration and the Plugin Hub.
- Add dark-mode surface styling for the Card Editor when embedded in Home
  Assistant.

## 0.1.13

- Add a real light/dark/auto theme switch to ATLAS Administration.
- Persist the shared ATLAS theme preference so the Plugin Hub follows the same
  selected mode.
- Add dark ATLAS colors for Administration and Plugin Hub testing in Home
  Assistant.

## 0.1.12

- Add an Atlas-branded repository dialog with URL entry, source type selection,
  repository preview and final confirmation.
- Use the orange ATLAS accent for repository add and planned install actions.

## 0.1.11

- Replace the single repository URL preview with a managed custom repository
  list similar to the Home Assistant/HACS custom repository workflow.
- Add repository type selection, refresh and remove controls.
- Preserve older single repository URL settings by migrating them into the new
  repository list.

## 0.1.10

- Add ATLAS start behavior for plugin counts: zero active plugins show the hub,
  one active plugin opens directly and multiple active plugins show the hub.
- Point Home Assistant ingress at the ATLAS app server so the plugin start
  decision can run before opening a plugin.

## 0.1.9

- Add the first ATLAS Plugin Hub surface with automatic plugin manifest and
  preview asset discovery.
- Package plugin manifest folders for Home Assistant App/Add-on testing.

## 0.1.8

- Resolve Card Editor Admin API requests against the current editor surface URL
  with a normalized trailing slash so Home Assistant ingress can load saved
  settings before auto-connect even when the ingress URL has no trailing slash.

## 0.1.7

- Use ingress-safe relative Card Editor Admin API paths so saved Add-on
  connection settings can load before auto-connect.

## 0.1.6

- Remove the static loopback Administration link from the Card Editor and route
  `/admin` to the current Home Assistant host on port `4175`.
- Derive Administration runtime metadata from the current host so visible links
  no longer fall back to `127.0.0.1` in Home Assistant.

## 0.1.5

- Derive the Card Editor "Open Atlas Administration" link from the current
  Home Assistant host so it opens the Administration surface on port `4175`.

## 0.1.4

- Keep the Administration "Open Card Editor" button on the current Home
  Assistant host instead of navigating to the fixed local loopback URL.

## 0.1.3

- Route Card Editor Admin API calls through the editor surface so Add-on option
  auto-connect works directly from Home Assistant ingress.

## 0.1.2

- Use a plain string schema for the Home Assistant token option so local
  Add-on configuration reloads do not pass a shortened password placeholder to
  ATLAS Administration.
- Ignore masked or implausibly short Add-on token values during startup.

## 0.1.1

- Add Home Assistant URL, token, token-import and auto-connect options.
- Pass Add-on connection options to ATLAS Administration during startup.
- Open the Card Editor through Add-on Ingress with ATLAS icon and logo assets.

## 0.1.0

- Add the first ATLAS Home Assistant App/Add-on packaging scaffold.
- Reuse the standalone ATLAS app runtime with Administration and Card Editor.
- Expose `/health` and `/app` for supervisor checks and preview status.
