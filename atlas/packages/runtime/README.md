# @atlas/runtime

Runtime package for application startup, service orchestration and framework
execution flow.

---

# Status

Active runtime package.

The first runtime component is `RuntimeHost`, which owns an application,
coordinates its lifecycle and publishes runtime lifecycle events through the
Kernel EventBus.

---

# Public API

`@atlas/runtime` exports:

- `RuntimeHost`
- `RuntimeHostConfiguration`
- `RuntimeConfigurationValidator`
- `RuntimeDiagnosticEvent`
- `RuntimeDiagnosticIssueCode`
- `RuntimeEvent`
- `RuntimeHealthReport`
- `RuntimeHealthState`
- `RuntimeModule`
- `RuntimeModuleHealthReport`
- `RuntimeModuleSnapshot`
- `RuntimeModuleStatus`
- `RuntimePlugin`
- `RuntimePluginActivationContext`
- `RuntimePluginAdministrationAction`
- `RuntimePluginAdministrationEntry`
- `RuntimePluginAdministrationStatus`
- `RuntimePluginAdministrationSummary`
- `RuntimePluginAdministrationView`
- `RuntimePluginCatalog`
- `RuntimePluginDescriptor`
- `RuntimePluginInstallPackage`
- `RuntimePluginInstallPackageFile`
- `RuntimePluginManifest`
- `RuntimeServiceKeys`
- `createRuntimeModuleFromPlugin`
- `createRuntimePluginAdministrationView`
- `createRuntimePluginInstallPackage`
- `describeRuntimePlugin`
- `normalizeRuntimePluginPackageName`
- `parseRuntimePluginInstallPackage`
- `serializeRuntimePluginInstallManifest`

`RuntimeHost` depends on `@atlas/foundation` lifecycle states and the
`@atlas/kernel` application and event contracts. Consumers may construct a host
from a `RuntimeHostConfiguration` or continue using the positional application,
EventBus and service-container constructor. Consumers may provide their own
`EventBus`, or use the default `DefaultEventBus`.

`RuntimeHost` owns a Kernel service container and registers its application and
EventBus under `RuntimeServiceKeys.application` and `RuntimeServiceKeys.events`.

Modules are registered with `RuntimeHost.registerModule` before startup. They
initialize once in registration order and may contribute services through the
Kernel module context. Required dependencies initialize before their dependents;
missing required dependencies and cycles reject startup. Missing optional
dependencies are allowed. Module versions use stable `MAJOR.MINOR.PATCH`
values: exact requirements must match exactly, `^` requirements follow SemVer
compatibility and `*` accepts any version.

`RuntimeHost.stop()` pauses the host but leaves initialized modules available
for restart. Terminal shutdown occurs during `dispose()`: optional module
`stop()` and `dispose()` capabilities run in reverse dependency order.

`RuntimeHost.moduleDiagnostics` exposes each registered module's lifecycle
status, version, activation or shutdown duration, timestamps and the latest
activation or shutdown error.

`RuntimeHost.health` promotes module diagnostics into a host-level health
summary. Failed modules make the Runtime failed, registered or stopped modules
make it degraded, and initialized or disposed modules are considered healthy.

`RuntimeHost.diagnostics` adapts Runtime health into the Foundation
`DiagnosticReport` contract. Degraded modules produce warning issues, failed
modules produce error issues, and stable Runtime diagnostic issue codes identify
the reported condition.

Runtime publishes `runtime.diagnostics.changed` whenever the aggregate Runtime
health changes. The event includes the previous health, current health and the
current health report. Diagnostic events are suppressed when health remains
unchanged and their subscribers are awaited before the surrounding lifecycle
transition continues.

Module registration is synchronous: it updates module diagnostics and health
immediately, but does not publish hidden asynchronous events. Diagnostic change
events are emitted from awaited lifecycle work such as startup and shutdown.
Runtime lifecycle events include timestamps, module lifecycle events include
module ids, and lifecycle event subscribers are awaited before the next
lifecycle event is published.

Runtime configuration is validated before use. Application names and version
parts must be present and valid; module manifests must define ids, names,
versions, dependency arrays and initialize functions.

Plugins use the same lifecycle infrastructure as Runtime modules. A
`RuntimePlugin` declares plugin metadata, optional extension points and provided
capabilities, then `createRuntimeModuleFromPlugin()` adapts it into a
`RuntimeModule`. Activation receives the regular Kernel module context plus the
original plugin manifest. Optional plugin `deactivate()` and `dispose()` hooks
are delegated to Runtime module shutdown.

`RuntimePluginCatalog` provides the first discovery surface. It registers
plugins by id, exposes immutable descriptors, finds plugins by extension point
or provided capability, and can convert its entries into Runtime modules for
host startup.

`createRuntimePluginAdministrationView()` prepares the future Atlas
Administration surface. It turns Plugin Catalog descriptors into status-aware
entries with actions such as inspect, activate, deactivate and export-package.

`createRuntimePluginInstallPackage()` provides the first install-package
contract. It writes an `atlas-plugin.json` manifest, a README and optional
additional files into a package description that later archive builders or
administration UIs can turn into a downloadable artifact.

`parseRuntimePluginInstallPackage()` reads such a package description back into
a validated plugin descriptor and file list. It does not execute plugin code;
administration surfaces can use it to inspect or register imported package
metadata safely.

The package-root public API is covered by contract tests. Consumers should
import Runtime types and values from `@atlas/runtime` rather than deep source
paths.

---

# Build Output

Compiled artifacts are emitted to `dist`.

Source files remain under `src`.
