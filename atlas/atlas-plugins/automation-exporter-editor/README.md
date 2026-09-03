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
- export selected automations as separate YAML files in timestamped run folders
- keep automation filenames clean, for example
  `/config/atlas_exports/automations/2026-09-03_15-23-37/kitchen_light.yaml`
- keep an overview of exported automations
- open File Studio for further editing

Write-back creates a timestamped backup before merging selected automations
into `/config/automations.yaml` by `id` or `alias`.
