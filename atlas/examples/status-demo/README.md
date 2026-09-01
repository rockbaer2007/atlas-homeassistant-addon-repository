# ATLAS Home Assistant Card Editor Demo

The demo renders the Home Assistant card editor workflow together with the
active Renderer and Theme integration in a browser.

Run `pnpm build`, then start it with:

```sh
node examples/status-demo/server.mjs
```

Open `http://127.0.0.1:4174/` and use the status controls to verify that each
selection replaces the current surface output while retaining the theme tokens.

The Atlas Administration surface runs separately on port `4175`:

```sh
node examples/admin-demo/server.mjs
```

Open `http://127.0.0.1:4175/` to manage reference plugins, plugin packages and
central Home Assistant connection settings.
For the standalone app packaging path, `pnpm start:app` starts both surfaces
together and exposes `http://127.0.0.1:4176/health` for Docker, Home Assistant
App/Add-on and Linux service checks. `http://127.0.0.1:4176/app` returns the
runtime links, ports and distribution order for packaging tools.
The shared distribution contract is tracked in
`docs/deployment/ATLAS_APP_DISTRIBUTION.md`.

The Home Assistant controls validate a connection target, show the derived
WebSocket endpoint and can connect to an instance after Atlas Administration
has handed over the connection settings. The Card Editor no longer contains a
token field and does not store Home Assistant tokens. Tokens are managed on the
separate Administration surface and handed to the current editor browser session
through `postMessage`. When enabled in Administration, the editor connects
automatically after receiving that handoff.
On desktop-sized screens the connection, card setup and entity-picker controls
use compact panel styling plus two- and three-column grids so related inputs
and actions sit together instead of stretching across the full page width.

The separate Administration demo reads the Runtime plugin catalog, shows the
Home Assistant Card Editor as the first reference plugin, exposes
inspect/activate/export-package actions and exports the generated
`.atlas-plugin.json` package descriptor. It also documents the intended
credential boundary: Home Assistant tokens stay in the central admin area,
while the editor receives a session-only handoff. Plugins receive only approved
context such as Home Assistant URL, WebSocket path and declared capabilities.
The Card Editor includes an opt-in Problem melden / Report problem flow. It
creates a sanitized debug report preview before anything is copied or opened on
GitHub. The report can include editor mode, selected entities, export settings,
resource status and the current card preview, but Home Assistant tokens,
provider API keys, cookies and localStorage are recorded as intentionally
excluded.

Enter one or more comma-separated Entity IDs before connecting, or use the
domain-filtered entity picker to add known demo entities. Once a live event
subscription is active, the demo requests Home Assistant `get_states` and
populates the picker from the returned entity list. The type selector filters
the picker by entity domain, such as `sensor`, `binary_sensor`, `switch` or
`light`, and quick buttons expose the common domains directly. The picker is
backed by the shared `@atlas/homeassistant` entity catalog, so domain filtering,
deduplication, live labels and partial search can be reused by future hosts.
The search field narrows the filtered picker further by matching parts of the
entity ID or friendly name, with a visible result count or empty state. The
primary entity drives the status panel and the list shows updates for all
selected entities.
Numeric and other available sensor values render as ready; `off` remains
pending, while unavailable or unknown entities render as blocked.

For a live `light` or `switch` entity, its card offers a single confirmed
turn-on or turn-off action. Commands are unavailable until the subscription is
active and are not available for other entity domains.

The URL, selected entities and optional token preference are stored only in this
browser. After an unexpected socket close, the open page retries up to three
times with its in-memory token; a manual disconnect stops retries. A normal
browser close with code `1000` is shown as a regular ATLAS connection close
instead of a raw WebSocket code.
The editor UI can now be switched between English and German from the header.
The selected language is stored with the same local demo configuration and is
restored after a reload. Static labels, editor mode controls, entity picker
feedback, stack summaries, dependency hints and the main import/export status
messages use the same translation table.
The current editor mode, Expert fields, selected Expert field and resized
Expert surface are also restored from the same local browser storage.

The panel-group selector provides quick entity sets for overview, energy and
safety. Selecting a group only updates the local entity list.

The same group selection also renders Home Assistant card code for built-in
Entities, Mushroom template or Bubble button targets. The preview can be copied
or exported as JSON or YAML for use in Home Assistant dashboards. Simple
Entities, Mushroom template and Bubble button card JSON or YAML can be imported
back into the demo as a new panel group through the shared import summary API.
HA card exports use target- and layout-specific filenames so the downloaded file
reflects whether it contains Entities, Mushroom or Bubble card code. Copy and
download use the same export payload and require at least one selected entity.
The card package export wraps the manifest and serialized card content in a
portable Atlas JSON envelope that can be imported back through the same HA card
import control. The HACS script filename field controls the JavaScript filename
stored in the embedded editor plan and normalizes names such as `Energy Kitchen`
to `energy-kitchen.js`; the exported package download follows the same base
name. The package also carries a generated custom-card JavaScript source with a
matching `custom:<card-name>` type, Home Assistant `getStubConfig()` defaults
and the demo-entity replacement hint for the later HACS card workflow. The
same source can also be downloaded directly through the Export card script
button. Card package and HACS bundle exports include selected Card language
files under `locales/`. English is always included as the required fallback;
additional languages are generated as English fallback files with metadata
notes that they must be translated and reviewed before publishing. Automatic
translation is not active in this first version and will require an internet
connection when added later.
Russian (`ru`) is included in the selectable Card export languages. The editor
also exposes an automatic-translation checkbox with a progress indicator. It
uses the translation module selected in Atlas Administration, but until a real
provider adapter is connected it still exports reviewed fallback files rather
than pretending that machine translation completed.
ChatGPT/OpenAI is the first connected provider path: when the provider is
selected, an API key is configured in Atlas Administration and automatic
translation is enabled, the Card Editor requests translated locale files through
the Administration `/api/card-translation` endpoint. The raw OpenAI API key is
not handed to the Card Editor.
When DeepL is selected, the Administration can hand over the prepared translate
endpoint `https://api.deepl.com/v2/translate`; the adapter implementation should
follow `https://developers.deepl.com/api-reference/translate/request-translation`.
Gemini is planned as an additional provider option using
`https://ai.google.dev/gemini-api/docs/api-key` for API-key and security
guidance. Provider API keys are not handed to the Card Editor.
Export HACS bundle downloads a real `.hacs.zip` archive containing the future
repository files: `hacs.json`, the generated JavaScript card, a README, an
example Lovelace card, the original Atlas card package and the selected
`locales/*.json` files.
The HA card import control also accepts `.hacs.zip` files now. It inspects the
archive structure, reports missing bundle files and reads the embedded
`atlas/*.atlas-card.json` package back into the Simple or Expert editor flow.
When the package is exported from Expert mode, the envelope also carries the
Expert editor plan so a later import can restore the placed fields and switch
back to Expert automatically.
When Expert mode is active, the simple card-layout selector and simple HA card
code block are hidden. Copy and export actions then use the Expert HA card code
generated from the editor surface.
The Panel group, Group name, Card target, Card layout and group action controls
are Simple-only and hidden in Expert mode because the Expert surface defines the
exported card structure directly. Expert mode uses its own Expert card name
field for copy, export and package filenames.
Before the HA card import is parsed, the demo now runs the shared artifact
inspection. Supported ATLAS packages and raw Home Assistant cards continue
directly. External card-builder-shaped artifacts pause on a compatibility
review that shows license, block, entity-slot, mapping and field-preview
details. Unknown artifacts are rejected before parsing.

When the demo is connected to Home Assistant, it requests Lovelace resources and
marks Mushroom or Bubble dependencies as found, missing or not yet checked. The
resource check can also be run manually from the card export controls. The
export manifest includes both the expected Lovelace resource and a HACS install
hint for custom cards. Mushroom uses `/hacsfiles/lovelace-mushroom/mushroom.js`.
Bubble Card uses `/hacsfiles/Bubble-Card/bubble-card.js`. All expected
Home Assistant and HACS resource paths are matched case-sensitively because
Home Assistant commonly runs on Linux. Without an active connection, the
dependency line keeps showing these paths as installation hints. The resource
snippet can be copied as JSON or YAML through the same card format selector.
It includes the ATLAS frontend resource and, in Expert mode, every Mushroom or
Bubble Card dependency used by the placed fields.

The visual status surface is now tucked into the Diagnostics panel. It remains
available as an ATLAS renderer/theme and entity-state smoke test, but it is no
longer part of the main card-editor workflow. It is not a Home Assistant
Lovelace renderer. The Diagnostics open state is stored with the local demo
configuration.

The demo also exposes the first Expert editor preview behind a Simple/Expert
mode switch. It renders the shared template palette as a left sidebar, lets a
host choose or drag a card template into the editor surface, places the field on
the bounded expert grid and renders the resulting nested Home Assistant card
code. Added fields are shown as movable tiles on the surface and are also listed
with a remove button so the preview can be adjusted without clearing the whole
surface. The surface now uses a larger visible 12-column Home Assistant-like
grid. Dragging existing fields snaps against the real inner grid and preserves
the point where the field was grabbed, so fields can be moved upward without
sideways jumps. The visual grid now sits on the same inner surface as the
draggable tiles, with a smaller tile gap for closer vertical stacking. Each
focused tile can also be nudged by one grid cell with the arrow keys; while
edit mode is active, Shift plus an arrow resizes the selected field by one cell.
Each sidebar template exposes its own column and row controls, including `full`
width and `auto` height. Entity List, State Button, Switch Button,
horizontal-stack and vertical-stack start from the same default footprint so
layout adjustments are predictable. The sidebar uses loaded Lovelace resources
to mark custom card families as installed, missing or unchecked. Surface tiles
can be selected and then switched into edit mode, where a bottom-right handle
resizes the field inside the 12-column grid. This is still a preview surface,
not the final drag-and-drop editor.
Expert field titles are editable from the surface controls. The title is reused
as the generated Home Assistant card title, Bubble name or Mushroom primary
text. A manual apply button writes the edited title to the selected field, and
the current Home Assistant entity name can still be copied into the title field
as a starting point.
In Expert mode, selecting an entity from the picker or entity list assigns it to
the currently selected surface field and also prefills the field title from the
entity name.
Bubble fields expose a Bubble button type dropdown with the supported
`state`, `switch`, `slider` and `name` values. The selected type is written into
the generated Bubble Card configuration.
The left Expert palette now lists Core cards and Community cards. Individual
cards can be marked as favorites with a checkbox and applied through the Save
favorites button. When saved favorites exist, the palette shows only those cards
until the reset button restores the full list. A Show all cards button reopens
the complete palette without deleting saved favorites, so several favorites can
be selected in one pass. A Scan HA cards button requests the current Home
Assistant Lovelace resources and adds recognized installed Community cards such
as Mushroom and Bubble Card to the palette. Other registered Lovelace resources
are shown as scanned-only entries until ATLAS has a safe card mapping for them.
Mapped resources are deduplicated so they do not appear again as scanned-only
copies.
Core templates include Entity, Entities, Button, Grid, Sensor, Vertical stack,
Horizontal stack, Thermostat, Link and Webpage. Webpage exports use the Home
Assistant `iframe` card type.
When Home Assistant connects, ATLAS requests the same resource list
automatically. Saved favorites hide every non-selected card, including scanned
`/hacsfiles/` entries, until Show all cards or Reset favorites is used.
Scanned-only HACS and HA resources can also be marked as favorites, even before
ATLAS has a draggable card mapping for them.
Helper resources such as card tools, dashboards, strategies, navigation helpers,
icon packs and known non-card resources are filtered out of the palette scan.
The palette itself is scrollable and uses compact two-column template rows:
card name and favorite state stay on the left, while layout details and sizing
controls sit on the right. Template column and row choices are stored with the
local demo configuration and can be restored to defaults with Reset sizes.
Selected editor fields can be resized with the mouse or through the Width and
Height controls in one-cell steps, up to five grid cells beyond their template
default size. The editor surface itself has a
visible bottom-right resize handle and can grow by up to five grid steps in
both directions while keeping the current size as the default. A Reset surface
size button returns the editor surface to the default footprint.
The Expert summary reports total fields, populated fields, empty placeholders,
occupied rows, current surface span, overlap count, card targets and field
layouts before the generated HA card code. Overlapping editor fields are marked
directly on the surface.
The Auto arrange action repacks fields into the first available free grid slots
in row and column order, reducing overlaps while keeping card content intact.
