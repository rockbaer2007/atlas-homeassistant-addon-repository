# @atlas/workspace

Workspace readiness package for Atlas.

`@atlas/workspace` describes the active package inventory, layer ordering,
quality gates and pre-activation integration closures used to keep framework
planning aligned with the repository. It does not start runtime features or
open planned integration package APIs.

The package exports:

- `ATLAS_WORKSPACE_PACKAGE_INVENTORY`
- `ATLAS_WORKSPACE_QUALITY_GATES`
- `ATLAS_PLANNED_INTEGRATION_CLOSURES`
- `ATLAS_NEXT_FRAMEWORK_CAPABILITY_DIRECTION`
- `createAtlasFrameworkReadiness`
- `createAtlasFrameworkCapabilityDirection`
- `inspectAtlasFrameworkReadiness`
- `inspectAtlasFrameworkCapabilityDirection`
- `assertAtlasFrameworkReadiness`
- `assertAtlasFrameworkCapabilityDirection`

The readiness model is intentionally metadata-only. It is used by tests and
documentation to confirm that root manifests, workspace packages and dependency
rules describe the same active framework shape before concrete framework
capabilities continue.

The next selected capability direction is Renderer output-to-target mounting.
It is owned by Core and Renderer, carries explicit quality gates and keeps
Theme, Home Assistant and Devtools public APIs closed while Renderer capability
work resumes.
