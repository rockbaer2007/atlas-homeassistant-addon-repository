# @atlas/core

Core package for ATLAS framework-level contracts and shared public entry
points.

---

# Status

Active core integration package.

`@atlas/core` is the first framework-level entry point above Runtime. It
provides a package-root API for creating a Runtime host through Core without
requiring consumers to deep-import Runtime internals. It also exposes a small
Core-level diagnostics helper that reads Runtime health and diagnostic reports
without moving diagnostic ownership out of Runtime. Core also provides a
minimal lifecycle transition helper over Runtime host lifecycle methods and a
typed event subscription helper for Runtime host events.

Core diagnostics remain a read-through boundary over Runtime. `inspectCoreRuntimeHost`
does not cache, normalize or reclassify Runtime health, diagnostic context or
issues; Runtime remains the source of truth for diagnostic reports.

Core Runtime event subscriptions are also pass-through boundaries. Core does
not reclassify lifecycle, module lifecycle or diagnostic events; event payloads,
awaiting behavior and subscription disposal remain owned by Runtime and Kernel.

Core lifecycle transitions are thin Runtime pass-throughs. `transitionCoreRuntimeHost`
invokes the requested Runtime lifecycle method and reports the resulting
Runtime state without swallowing errors or adding a separate Core lifecycle
state machine.

Core Runtime host creation remains a Runtime pass-through. `createCoreRuntimeHost`
forwards application configuration, custom event buses, custom service
containers and initial modules to Runtime, while Runtime continues to own
validation, module ordering, diagnostics and lifecycle behavior.

The Core package root intentionally exposes only the compact value helpers
needed above Runtime. Type aliases document the Core boundary, while Runtime
continues to own the underlying host, diagnostics, events and lifecycle
behavior.

---

# Public API

`@atlas/core` exports:

- `CoreRuntimeHost`
- `CoreRuntimeHostConfiguration`
- `CoreRuntimeHealthReport`
- `CoreRuntimeDiagnosticReport`
- `CoreRuntimeDiagnostics`
- `CoreRuntimeEvent`
- `CoreRuntimeEventType`
- `CoreRuntimeEventSubscription`
- `CoreRuntimeEventHandler`
- `CoreRuntimeLifecycleAction`
- `CoreRuntimeLifecycleState`
- `CoreRuntimeLifecycleResult`
- `createCoreRuntimeHost`
- `inspectCoreRuntimeHost`
- `subscribeToCoreRuntimeEvent`
- `transitionCoreRuntimeHost`

Core currently depends on `@atlas/runtime` and intentionally keeps its public
surface compact while higher-level Core concepts are defined. The package-root
value and type surface is protected by public API contract tests.

---

# Build Output

Compiled artifacts are emitted to `dist`.

Source files remain under `src`.
