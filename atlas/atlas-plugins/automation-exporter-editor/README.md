# ATLAS Automation Exporter / Editor

ATLAS Automation Exporter / Editor is an ATLAS plugin for Home Assistant
automation workflows. It starts as a safe analysis and export surface inspired
by the existing Windows Automation Exporter.

## First Scope

- read `/config/automations.yaml` through the approved File Studio path
- upload external `.yaml` or `.yml` files for local analysis
- list detected automations with alias, id, entities and services
- configure a target export folder label
- export selected automations as separate YAML files
- name exports as `name_dd_mm_yy-hh_mm_ss.yaml`
- keep an overview of exported automations
- open File Studio for further editing

The first version does not write back into Home Assistant automatically.
