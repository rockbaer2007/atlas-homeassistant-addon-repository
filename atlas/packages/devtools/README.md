# @atlas/devtools

Developer tooling package for read-only diagnostic summaries and future
validation and project workflow utilities.

---

# Current API

`summarizeDiagnostics(reports)` builds a compact status from Foundation
`DiagnosticReport` values. It returns `unavailable` when there are no reports,
`healthy` when all reports pass, and `issues` when at least one report fails.
It also returns report and issue totals and counts by severity. Inputs are not
modified.

The API is inspection-only. It does not read Home Assistant state, change
workspace files, or start development servers.

# Future work

Interactive diagnostics panels, workspace mutation, Renderer/Theme integration
and dev-server controls require separate contracts and are not part of the
current package API.

---

# Build Output

Compiled artifacts are emitted to `dist`.

Source files remain under `src`.
