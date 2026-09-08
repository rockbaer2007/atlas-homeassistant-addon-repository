# ATLAS Automation Exporter / Editor

ATLAS Automation Exporter / Editor is an ATLAS plugin for Home Assistant
automation workflows. It starts as a safe analysis and export surface inspired
by the existing Windows Automation Exporter.

## First Scope

- read `/config/automations.yaml` through the approved File Studio path
- upload external `.yaml` or `.yml` files for local analysis
- list detected automations with alias, id, entities and classic `service:` or
  modern `action: domain.service` calls
- show analysis warnings for missing or duplicate ids/aliases, missing triggers
  or actions and disabled automations
- show the selected automation YAML with Studio-like highlighting
- keep the automation list internally scrollable with roughly 15 visible rows
- configure a target export folder label
- create a safety backup before reading the real `/config/automations.yaml`
- store backups in timestamped folders while keeping the filename
  `automations.yaml`
- export selected automations as separate YAML files in timestamped run folders
- write a normal `export-version` with `id` and a
  `bereinigte-import-version` without `id` for the Home Assistant YAML editor
- keep automation filenames clean, for example
  `/config/atlas_exports/automations/2026-09-08_19-30-12-125/export-version/kitchen_light.yaml`
- keep an overview of exported automations
- open File Studio for further editing

The plugin does not write back into Home Assistant system files. Editing and
manual restore workflows should continue through File Studio and Home
Assistant's own YAML tools.
