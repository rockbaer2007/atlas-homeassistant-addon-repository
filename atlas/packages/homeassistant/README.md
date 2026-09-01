# @atlas/homeassistant

Home Assistant status panel integration for the ATLAS Framework.

---

# Status

Active status panel integration package.

The package provides a themed status panel through the active Renderer and Theme
surface path, plus narrow Home Assistant runtime helpers for entity state,
service calls, Lovelace resources and card configuration.

The package root exports the status panel contract, renderer-backed panel
execution and the first Home Assistant card editor reference plugin. Its UI
dependency direction runs through Theme rather than a direct Renderer
dependency, while Runtime is used deliberately for the plugin contract.

Local entity state contracts map `on`, `off`, available non-binary values,
`unavailable` and `unknown` into panel states. Status panels can be collected
in a registry. Entity updates preserve their display name, original value and
unit where Home Assistant provides them, and connection configuration is
validated without opening a network connection.

An in-memory entity transport supports local publishing and panel subscriptions.
The same contract will be implemented by a future authenticated WebSocket
transport; configuration can already derive its eventual `/api/websocket` URL.

The current WebSocket client is fully testable through an injected socket. It
models authentication, subscription confirmation or rejection, state changes,
close reasons and subscribable lifecycle states. The browser adapter can open a
connection when explicitly used by a host application; it maps normal close
code `1000` to a user-facing ATLAS close message and never persists access
tokens.

The client can send explicit `turn_on` and `turn_off` requests only for `light`
and `switch` entities after a successful event subscription. Hosts remain
responsible for requiring a user confirmation before invoking these commands.
Service results are exposed to the host so a command can be reported as
completed or failed.

Reusable panel groups collect entity IDs under a stable title. Entity
presentations classify common temperature, power, battery, light and switch
states. Entity catalogs normalize known and live entity IDs into a sorted,
deduplicated list with domains, labels and searchable text so hosts can provide
the same entity picker behavior outside the demo. Basic Home Assistant card
configuration can be created for built-in Entities, Mushroom template and
Bubble button targets, serialized as JSON or YAML, parsed back into normalized
entity groups, and inspected for required frontend dependencies. Hosts can list
the supported card targets from the same package API they use for export and
import; dependency metadata includes expected HACS resource paths and can be
compared with Lovelace resources returned by Home Assistant. Card export
manifests provide stable filenames, formats, MIME types, target, layout and
dependency metadata for host UIs. Card export payloads pair that manifest
metadata with the serialized card content so copy and download flows can share
one source. Card packages wrap the manifest and content in a portable Atlas JSON
envelope for round-tripping through editor UIs. Lovelace resource references can
be derived from the selected card target and serialized as JSON or YAML, which
lets host UIs offer copy-ready HACS resource snippets for Mushroom and Bubble
Card. Resource availability checks intentionally match paths case-sensitively
because Home Assistant often runs on Linux. Card import summaries normalize raw
card text or Atlas packages into title, entity IDs, target, layout, format and
dependency metadata. The WebSocket
client can request `get_states` and `lovelace/resources` as soon as
authentication succeeds, even while the live event subscription is still
pending. Lights can receive a validated brightness percentage from 1 through
100 when a host explicitly invokes the command.
The demo keeps the connection controls compact and can reconnect on page load
when the user explicitly combines local token storage with the auto-connect
option.

The Home Assistant card editor is now modeled as the first official ATLAS
reference plugin. `createHomeAssistantCardEditorPlugin()` returns a
`RuntimePlugin` with extension points for card editing, card targets, entity
selection, exporters and package building. Runtime activation registers a
service containing the editor's card targets, palette templates, Bubble button
types and capabilities, so the future Atlas Administration can discover and
display the editor through the Plugin Catalog.
`createHomeAssistantCardEditorPluginInstallPackage()` projects the same
reference plugin into the Runtime install-package contract with a manifest,
README and example Home Assistant card YAML.
`createHomeAssistantCardEditorAppReleaseReadiness()` describes the local app
release path with Administration and Card Editor entrypoints, completed
safeguards such as opt-in problem reports, the reference plugin package state
and the remaining HACS distribution targets. The standalone Docker path now
builds the local image, starts both app surfaces and passes the container
health check.
The Home Assistant App/Add-on scaffold now builds a local preview image from
the same container/runtime and reports `home-assistant-app-preview` through
`/app`. The next packaging check is installing the prepared app folder in a
local Home Assistant `/addons` directory, followed by an optional Linux
VM/LXC/bare-Linux installer with a systemd service.

Frontend integration plans describe the resource that makes ATLAS itself
available inside Home Assistant. Hosts can choose the current self-hosted server
mode, which defaults to `/local/atlas/atlas-homeassistant-panel.js`, or the
planned HACS mode at `/hacsfiles/atlas/atlas-homeassistant-panel.js`. The same
plan combines ATLAS frontend availability with the selected card dependency.
Editor-specific frontend plans can also combine ATLAS with every dependency
used by Simple or mixed Expert fields, so a host can report whether ATLAS,
Mushroom or Bubble Card resources are ready or which Lovelace resource paths
are still missing. Hosts can serialize those combined plans as JSON or YAML
Lovelace resources, giving the UI one copy action for ATLAS plus all selected
or placed Mushroom and Bubble Card dependencies.

A first HACS card editor package plan is available for the later installable
custom card workflow. It describes a drag-and-drop layout editor, keeps the
visible card name separate from the generated JavaScript filename, normalizes
user-defined filenames such as `Energy Kitchen` to `energy-kitchen.js`, and
uses demo entities (`binary_sensor.atlas_status`, `sensor.atlas_temperature`)
with a clear replacement hint for Home Assistant users.
The status demo exposes that filename as a package-export field, persists it in
the local configuration and restores it again when an ATLAS card package is
imported.
The same package plan can generate an installable custom-card JavaScript source.
That export includes the normalized filename, the Lovelace `custom:<name>` card
type, the `/hacsfiles/atlas/...` resource path, a `getStubConfig()` default with
the safe demo entities and the replacement hint users should see before wiring
their own Home Assistant entities.
The status demo exposes this source as a direct script download next to the
portable card package export, so the generated `.js` artifact can be inspected
or staged separately before a full HACS bundle is produced.
For the next packaging step, the package can create a dependency-free `.hacs.zip`
archive. The archive contains the files a host needs for a frontend repository:
`hacs.json`, the generated card script, a README, an example Lovelace card
configuration, selected `locales/*.json` language files and the original Atlas
card package for round-trip editing. English is always included as the required
fallback language. Additional selected languages are generated as English
fallback files with metadata notes that they must be translated and reviewed
before publishing.
Archives can also be inspected again before import. The inspection reads the
ZIP central directory, checks for `hacs.json`, `README.md`, an example card, a
root JavaScript card file and the embedded Atlas card package, and the embedded
`atlas/*.atlas-card.json` file can be read back for round-trip editor import.

The card editor plan separates a simple mode from an expert mode. Simple mode
is intended for fast button stacks. Expert mode describes a free editor surface
where every positioned field can choose its own card target: built-in Entities,
Bubble Card or Mushroom template. The dependency plan can derive the actually
used card targets from the editor mode and fields, so mixed expert layouts can
produce one combined list of required HACS resources.

Editor plans can now also be projected into Home Assistant card configurations.
Simple mode creates the selected target from the plan entities. Expert mode
orders populated surface fields by row and column. Multiple fields on the same
row become a `horizontal-stack`; multiple rows become a wrapping
`vertical-stack`. A field can also be marked as its own `horizontal-stack` or
`vertical-stack`, so a selected surface area can contain several child entries.
Empty expert plans fall back to the safe demo entities, preserving a usable
export while the user still has to replace them with real Home Assistant
entities.
In the demo UI, Expert mode hides the simple card-layout selector and the simple
HA card code block. Export, package export, copy and resource copy use the
Expert HA card configuration whenever Expert mode is active.

The expert editor model also exposes a sidebar template palette. Hosts can list
visual templates for entity lists, state buttons, switch buttons,
`vertical-stack` and `horizontal-stack` areas. A selected template can be
combined with a chosen card family, such as Bubble Card or Mushroom, and placed
inside a bounded editor grid. Placement is clamped to the configured grid so
fields cannot be dropped outside the valid surface.
In the demo surface, placed fields can be selected and switched into edit mode.
Edit mode shows corner handles only for the selected field and resizes it within
the same grid bounds.
Placed fields also expose an editable title. That title becomes the generated
Entities title, Bubble button name or Mushroom primary text. Hosts can apply a
typed title to the selected field or copy the selected Home Assistant entity
name into the title field to prefill card labels.
When Expert mode is active, selecting an entity in the demo assigns it to the
currently selected editor field instead of only changing the simple preview.
Bubble fields can now carry a selected Bubble button type. The current supported
values are `state`, `switch`, `slider` and `name`, and the value is emitted as
`button_type` in the generated Bubble Card YAML or JSON.
The demo palette separates Core and Community cards and supports checkbox-based
favorites. Favorite checkboxes are applied with Save favorites; once one or
more favorites are saved, the palette hides the rest until the reset control
shows every card again.
The package can also analyze an Expert editor surface. The analysis reports
total and populated fields, empty placeholders, occupied rows, used grid span,
overlapping fields, card targets and field layouts. The demo uses that summary
above the Expert HA card code so export readiness is visible before copying
YAML or JSON, and marks overlapping tiles directly on the editor surface.
An arrange helper can repack fields into the first available free grid slots in
row and column order. The demo exposes this through Auto arrange, which turns
overlap warnings into a cleaner export layout without changing card content.

The visual editor direction is informed by existing Home Assistant projects,
including `studiobts/home-assistant-card-builder`. That project is tracked as
an external AGPL-3.0 reference for inspiration, interoperability and possible
future fork evaluation. ATLAS does not copy its source code by default; any
future derivative use must keep attribution and satisfy the AGPL-3.0 license.
The current interoperability plan allows product-level reference and planned
schema-based import/export evaluation, while direct source copying is explicitly
blocked unless ATLAS intentionally accepts the derivative-work and AGPL-3.0
obligations.

Import flows can inspect artifacts before parsing. The inspection classifies
ATLAS card packages, raw Home Assistant card snippets, possible external
card-builder exports and unknown content. External card-builder-shaped files
are deliberately marked as requiring review until an explicit compatibility
mapping exists.
Hosts can turn that inspection into an import decision: supported artifacts can
continue directly, external card-builder-shaped files open a compatibility
review, and unknown content is rejected.
Compatibility reviews currently report the license boundary, detected visual
block count, detected entity-slot count and the next mapping step. This gives a
host UI enough information to show a review dialog before any external artifact
is converted into ATLAS fields.
Mapping previews can classify common external block types into ATLAS templates:
state-like blocks become state buttons, switch-like blocks become switch
buttons, and horizontal or vertical layout blocks become matching stack
templates. Unmapped blocks remain visible for manual review.
ATLAS can also preview editor fields from mapped external blocks. These fields
are placed onto the expert grid with empty entities and remain marked as
review-required, so a host can show the conversion result without silently
importing it.
The status demo uses this flow before HA-card imports: supported ATLAS packages
and raw Home Assistant cards import directly, external card-builder-shaped files
show a compatibility review, and unknown content is rejected before parsing.
The demo now also shows a first Expert editor preview using the shared,
clickable template palette and grid placement contracts. Hosts can add
template-backed fields and inspect the generated nested Home Assistant card code
before a full drag-and-drop surface exists. The demo field list also supports
removing individual preview fields.

Imports now accept nested Home Assistant cards as well. A real-world
`vertical-stack` can contain `horizontal-stack` rows, `grid` containers,
`conditional` cards and regular cards, and ATLAS will keep the supported
structure while extracting the involved entities. Bubble header or separator
cards without an entity are accepted too, as are hand-built Bubble switch
columns and `empty-column` cards. Advanced Bubble Card details such as
`modules`, `styles`, `grid_options`, sliders and sub-buttons are planned as a
later preservation layer.

The visible Expert demo surface now uses a larger Home Assistant-like
12-column grid. Sidebar templates expose per-block sizing controls for columns
1-12 or `full`, plus rows `auto` or 1-8. Core templates start with the same
default footprint, while horizontal-stack drops can grow with the selected stack
entity count.

A browser-compatible socket adapter and runtime connection controller are
available for an instance. Tokens are supplied per connect or reconnect call
and are not retained by the controller.

The integration boundary remains intentionally narrow: status panels can mount
to a configured DOM-compatible surface, while all runtime and Home Assistant
transport concerns remain outside the package.

Richer Home Assistant card infrastructure remains planned future work.

---

# Build Output

Compiled artifacts are emitted to `dist`.

Source files remain under `src`.
