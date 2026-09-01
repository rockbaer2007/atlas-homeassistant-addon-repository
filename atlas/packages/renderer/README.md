# @atlas/renderer

Renderer package for future rendering pipeline and component output
infrastructure.

---

# Status

Active rendering integration package.

Renderer is the first integration package above `@atlas/core`. It provides a
small package-root API for creating a renderer host context from a Core Runtime
host, defining ordered renderer pipeline stages and executing those stages
sequentially. It also defines a first output shape without binding output to a
target, DOM, Home Assistant surface or theme model yet. Renderer targets can now
be exercised through concrete memory and DOM-like adapters without opening Home
Assistant or theme execution paths.

---

# Public API

`@atlas/renderer` exports:

- `RendererHostContext`
- `RendererIntegrationHandoff`
- `RendererIntegrationHandoffSnapshot`
- `RendererIntegrationHandoffSnapshotCatalog`
- `RendererIntegrationPreparation`
- `RendererIntegrationReadiness`
- `RendererAdapter`
- `RendererAdapterConflict`
- `RendererAdapterConflictResolution`
- `RendererAdapterLookupRequest`
- `RendererAdapterLookupResult`
- `RendererAdapterMountResult`
- `RendererAdapterRegistry`
- `RendererAdapterSelectionRequest`
- `RendererAdapterSelectionResult`
- `RendererConcreteIntegrationBoundaryExecutionClosure`
- `RendererConcreteIntegrationBoundaryExecutionClosureSnapshot`
- `RendererConcreteIntegrationBoundaryExecutionClosureSnapshotCatalog`
- `RendererConcreteIntegrationBoundaryExecutionDelivery`
- `RendererConcreteIntegrationBoundaryExecutionDeliverySnapshot`
- `RendererConcreteIntegrationBoundaryExecutionDeliverySnapshotCatalog`
- `RendererConcreteIntegrationBoundaryExecutionExport`
- `RendererConcreteIntegrationBoundaryExecutionExportSnapshot`
- `RendererConcreteIntegrationBoundaryExecutionExportSnapshotCatalog`
- `RendererConcreteIntegrationBoundaryExecutionPreparation`
- `RendererConcreteIntegrationBoundaryFinalization`
- `RendererConcreteIntegrationBoundaryFinalizationExport`
- `RendererConcreteIntegrationBoundaryFinalizationExportSnapshot`
- `RendererConcreteIntegrationBoundaryFinalizationExportSnapshotCatalog`
- `RendererConcreteIntegrationBoundaryFinalizationHandoff`
- `RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshot`
- `RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshotCatalog`
- `RendererConcreteIntegrationBoundaryFinalizationSnapshot`
- `RendererConcreteIntegrationBoundaryFinalizationSnapshotCatalog`
- `RendererConcreteIntegrationBoundaryReleaseClosure`
- `RendererConcreteIntegrationBoundaryReleaseClosureDelivery`
- `RendererConcreteIntegrationBoundaryReleaseClosureExport`
- `RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshot`
- `RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshotCatalog`
- `RendererConcreteIntegrationBoundaryReleaseClosureSnapshot`
- `RendererConcreteIntegrationBoundaryReleaseClosureSnapshotCatalog`
- `RendererConcreteIntegrationBoundaryRelease`
- `RendererConcreteIntegrationBoundaryReleaseExport`
- `RendererConcreteIntegrationBoundaryReleaseExportSnapshot`
- `RendererConcreteIntegrationBoundaryReleaseExportSnapshotCatalog`
- `RendererConcreteIntegrationBoundaryReleaseSnapshot`
- `RendererConcreteIntegrationBoundaryReleaseSnapshotCatalog`
- `RendererConcreteIntegrationBoundaryDecision`
- `RendererConcreteIntegrationBoundaryPlan`
- `RendererConcreteIntegrationBoundaryPlanSnapshot`
- `RendererConcreteIntegrationBoundaryPlanSnapshotCatalog`
- `RendererConcreteIntegrationBoundaryReview`
- `RendererMountRequest`
- `RendererMountResult`
- `RendererMountDiagnosticCodes`
- `RendererMountDiagnosticReport`
- `RendererDefaultMountAdapterRegistry`
- `RendererTargetMountIntegrationReadiness`
- `RendererTargetMountIntegrationReadinessCatalog`
- `RendererTargetMountIntegrationReadinessCatalogExport`
- `RendererTargetMountIntegrationReadinessCatalogSnapshot`
- `RendererTargetMountIntegrationReadinessCatalogSummary`
- `RendererTargetMountIntegrationReadinessHandoff`
- `RendererTargetMountIntegrationReadinessHandoffFilter`
- `RendererTargetMountIntegrationReadinessIssue`
- `RendererTargetMountIntegrationReadinessSnapshot`
- `RendererTargetMountIntegrationStatus`
- `RendererTargetMountIntegrationStatusHistory`
- `RendererTargetMountIntegrationStatusHistoryExport`
- `RendererTargetMountIntegrationStatusHistorySnapshot`
- `RendererTargetMountAdapterResolution`
- `RendererUnifiedMountBatchConsumptionRequest`
- `RendererUnifiedMountBatchDiagnosticCatalog`
- `RendererUnifiedMountBatchDiagnosticCatalogExport`
- `RendererUnifiedMountBatchDiagnosticCatalogSnapshot`
- `RendererUnifiedMountBatchDiagnosticCatalogSummary`
- `RendererUnifiedMountBatchDiagnosticClosure`
- `RendererUnifiedMountBatchDiagnosticHandoff`
- `RendererUnifiedMountBatchDiagnosticSnapshot`
- `RendererUnifiedMountBatchExecution`
- `RendererUnifiedMountBatchRequest`
- `RendererUnifiedMountExecution`
- `RendererUnifiedMountRequest`
- `RendererDomMountAdapter`
- `RendererDomMountDiagnostic`
- `RendererDomMountLookupRequest`
- `RendererDomMountRecord`
- `RendererDomMountStore`
- `RendererDomMountSummary`
- `RendererDomSurface`
- `RendererDomSurfaceAdapter`
- `RendererDomSurfaceElement`
- `RendererDomSurfaceLookup`
- `RendererDomSurfaceRegistry`
- `RendererDomSurfaceScenario`
- `RendererDomSurfaceMountAdapterRegistry`
- `RendererMountLifecycleRecord`
- `RendererMountLifecycleReport`
- `RendererMountLifecycleState`
- `RendererMemoryMountAdapter`
- `RendererMemoryMountRecord`
- `RendererMemoryMountStore`
- `RendererMountPlan`
- `RendererMountPlanExecution`
- `RendererMountPlanQualityGate`
- `RendererMountPlanReport`
- `RendererMountPlanStatus`
- `RendererMountPlanStrategy`
- `RendererMountReport`
- `RendererMountReportConsumer`
- `RendererMountReportConsumerConflict`
- `RendererMountReportConsumerConflictResolution`
- `RendererMountReportConsumerDiagnosticDeliveryBundle`
- `RendererMountReportConsumerDiagnosticDeliveryBundleSnapshot`
- `RendererMountReportConsumerDiagnosticDelivery`
- `RendererMountReportConsumerDiagnosticDeliveryExport`
- `RendererMountReportConsumerDiagnosticDeliveryManifest`
- `RendererMountReportConsumerDiagnosticDeliveryManifestClosure`
- `RendererMountReportConsumerDiagnosticDeliverySnapshotCatalog`
- `RendererMountReportConsumerDiagnosticAggregation`
- `RendererMountReportConsumerDiagnosticAggregationSummary`
- `RendererMountReportConsumerDiagnosticBatchExecution`
- `RendererMountReportConsumerDiagnosticExecution`
- `RendererMountReportConsumerDiagnosticPolicy`
- `RendererMountReportConsumerDiagnosticPolicyCodes`
- `RendererMountReportConsumerDiagnosticPolicyEvaluation`
- `RendererMountReportConsumerDiagnosticRegistryExecution`
- `RendererMountReportConsumerDiagnosticRegistryExecutionClosure`
- `RendererMountReportConsumerDiagnosticReport`
- `RendererMountReportConsumerDiagnosticCodes`
- `RendererMountReportConsumerLookupRequest`
- `RendererMountReportConsumerLookupResult`
- `RendererMountReportConsumerOutput`
- `RendererMountReportConsumerRegistry`
- `RendererMountReportConsumerResult`
- `RendererMountReportConsumerSelectionRequest`
- `RendererMountReportConsumerSelectionResult`
- `RendererMountReportConsumption`
- `RendererMountReportConsumptionRequest`
- `RendererMountReportFilter`
- `RendererMountReportIssue`
- `RendererMountReportSummary`
- `RendererOutput`
- `RendererOutputKind`
- `RendererPipeline`
- `RendererPipelineExecutionResult`
- `RendererPlatformAdapter`
- `RendererPlatformAdapterConflict`
- `RendererPlatformAdapterConflictResolution`
- `RendererPlatformAdapterLookupRequest`
- `RendererPlatformAdapterLookupResult`
- `RendererPlatformAdapterRegistry`
- `RendererPlatformAdapterSelectionRequest`
- `RendererPlatformAdapterSelectionResult`
- `RendererPipelineStage`
- `RendererPipelineStageResult`
- `RendererDefaultMountAdapterNames`
- `RendererTarget`
- `RendererTargetKind`
- `aggregateRendererMountReportConsumerDiagnostics`
- `closeRendererConcreteIntegrationBoundaryExecution`
- `closeRendererConcreteIntegrationBoundaryRelease`
- `closeRendererTargetMountBatchDiagnostics`
- `clearRendererDomMountStore`
- `clearRendererMemoryMountStore`
- `createRendererConcreteIntegrationBoundaryExecutionClosureSnapshotCatalog`
- `createRendererConcreteIntegrationBoundaryExecutionDelivery`
- `createRendererConcreteIntegrationBoundaryExecutionDeliverySnapshotCatalog`
- `createRendererConcreteIntegrationBoundaryExecutionExport`
- `createRendererConcreteIntegrationBoundaryExecutionExportSnapshotCatalog`
- `createRendererConcreteIntegrationBoundaryFinalizationExport`
- `createRendererConcreteIntegrationBoundaryFinalizationExportSnapshotCatalog`
- `createRendererConcreteIntegrationBoundaryFinalizationHandoff`
- `createRendererConcreteIntegrationBoundaryFinalizationHandoffSnapshotCatalog`
- `createRendererConcreteIntegrationBoundaryFinalizationSnapshotCatalog`
- `createRendererConcreteIntegrationBoundaryRelease`
- `createRendererConcreteIntegrationBoundaryReleaseClosureDelivery`
- `createRendererConcreteIntegrationBoundaryReleaseExport`
- `createRendererConcreteIntegrationBoundaryReleaseExportSnapshotCatalog`
- `createRendererConcreteIntegrationBoundaryReleaseClosureExport`
- `createRendererConcreteIntegrationBoundaryReleaseClosureExportSnapshotCatalog`
- `createRendererConcreteIntegrationBoundaryReleaseClosureSnapshotCatalog`
- `createRendererConcreteIntegrationBoundaryReleaseSnapshotCatalog`
- `createRendererAdapter`
- `createRendererAdapterConflict`
- `createRendererAdapterConflictResolution`
- `createRendererAdapterLookupRequest`
- `createRendererAdapterLookupResult`
- `createRendererAdapterRegistry`
- `createRendererAdapterSelectionRequest`
- `createRendererAdapterSelectionResult`
- `createRendererHostContext`
- `createRendererConcreteIntegrationBoundaryDecision`
- `createRendererConcreteIntegrationBoundaryPlan`
- `createRendererConcreteIntegrationBoundaryPlanSnapshotCatalog`
- `createRendererIntegrationHandoff`
- `createRendererIntegrationHandoffSnapshotCatalog`
- `createRendererIntegrationPreparation`
- `createDefaultRendererMountPlan`
- `createRendererMountPlan`
- `createRendererMountReport`
- `createRendererMountReportConsumer`
- `createRendererMountReportConsumerConflict`
- `createRendererMountReportConsumerConflictResolution`
- `createRendererMountReportConsumerDiagnosticDeliveryBundle`
- `createRendererMountReportConsumerDiagnosticDelivery`
- `createRendererMountReportConsumerDiagnosticDeliveryExport`
- `createRendererMountReportConsumerDiagnosticDeliveryManifest`
- `createRendererMountReportConsumerDiagnosticDeliverySnapshotCatalog`
- `createRendererMountReportConsumerLookupRequest`
- `createRendererMountReportConsumerLookupResult`
- `createRendererMountReportConsumerRegistry`
- `createRendererMountReportConsumerSelectionRequest`
- `createRendererMountReportConsumerSelectionResult`
- `createRendererMountReportConsumption`
- `createDefaultRendererMountAdapterRegistry`
- `createRendererMountRequest`
- `createRendererMountLifecycleRecord`
- `createRendererMountResult`
- `createRendererDomMountAdapter`
- `createRendererDomMountPlan`
- `createRendererDomMountRecord`
- `createRendererDomMountStore`
- `createRendererDomSurfaceRegistry`
- `createRendererDomSurfaceAdapter`
- `createRendererDomSurfaceMountAdapterRegistry`
- `createRendererMemoryMountAdapter`
- `createRendererMemoryMountPlan`
- `createRendererMemoryMountRecord`
- `createRendererMemoryMountStore`
- `createRendererOutput`
- `createRendererPipeline`
- `createRendererPlatformAdapter`
- `createRendererPlatformAdapterConflict`
- `createRendererPlatformAdapterConflictResolution`
- `createRendererPlatformAdapterLookupRequest`
- `createRendererPlatformAdapterLookupResult`
- `createRendererPlatformAdapterRegistry`
- `createRendererPlatformAdapterSelectionRequest`
- `createRendererPlatformAdapterSelectionResult`
- `createRendererTargetMountBatchDiagnosticCatalog`
- `createRendererTarget`
- `consumeRendererTargetMountBatchReports`
- `consumeAndInspectRendererMountReportConsumerRegistry`
- `consumeAndInspectRendererMountReportConsumers`
- `consumeAndInspectRendererMountReports`
- `consumeRendererMountReports`
- `evaluateRendererMountReportConsumerDiagnosticPolicy`
- `executeRendererDomMountPlan`
- `executeRendererDomSurfaceScenario`
- `executeRendererMountPlan`
- `executeRendererTargetMountBatch`
- `executeRendererTargetMount`
- `executeRendererTargetMountWithReport`
- `exportRendererTargetMountBatchDiagnosticCatalog`
- `executeRendererPipeline`
- `executeRendererMemoryMountPlan`
- `finalizeRendererConcreteIntegrationBoundary`
- `findRendererTargetMountBatchFailures`
- `findRendererAdapter`
- `findRendererAdapterConflicts`
- `findLatestRendererDomMountRecord`
- `findLatestRendererMemoryMountRecord`
- `findRendererDomMountRecords`
- `findRendererDomSurface`
- `findRendererMemoryMountRecords`
- `findRendererMountReportConsumer`
- `findRendererMountReportConsumerConflicts`
- `findRendererPlatformAdapter`
- `findRendererPlatformAdapterConflicts`
- `handoffRendererTargetMountBatchDiagnostics`
- `handoffRendererTargetMountIntegrationReadiness`
- `createRendererTargetMountIntegrationReadinessCatalog`
- `createRendererTargetMountIntegrationStatusHistory`
- `inspectRendererDomMountResult`
- `inspectRendererMountLifecycleRecord`
- `inspectRendererMountPlan`
- `inspectRendererMemoryMountResult`
- `inspectRendererMountReportConsumerResult`
- `inspectRendererMountResult`
- `isRendererMountPlanReady`
- `mountResolvedRendererAdapter`
- `mountRendererOutputToDomSurface`
- `mountResolvedRendererPlatformAdapter`
- `prepareRendererConcreteIntegrationBoundaryExecution`
- `recordRendererMountLifecycleExecution`
- `recordRendererMountLifecycleReport`
- `resolveRendererAdapterConflictWithFirstCandidate`
- `resolveRendererAdapterRegistryConflictsWithFirstCandidate`
- `resolveRendererMountReportConsumerConflictWithFirstCandidate`
- `resolveRendererMountReportConsumerRegistryConflictsWithFirstCandidate`
- `resolveRendererTargetMountAdapter`
- `reviewRendererMountReportConsumerDiagnosticDeliveryManifest`
- `reviewRendererMountReportConsumerDiagnosticRegistryExecution`
- `reviewRendererConcreteIntegrationBoundary`
- `reviewRendererIntegrationPreparationReadiness`
- `reviewRendererTargetMountIntegrationReadiness`
- `findRendererTargetMountIntegrationReadinessHandoffs`
- `findRendererTargetMountIntegrationStatusHistoryEntries`
- `resolveRendererPlatformAdapterConflictWithFirstCandidate`
- `resolveRendererPlatformAdapterRegistryConflictsWithFirstCandidate`
- `selectFirstRendererAdapterCandidate`
- `selectFirstRendererMountReportConsumerCandidate`
- `selectFirstRendererPlatformAdapterCandidate`
- `snapshotRendererConcreteIntegrationBoundaryExecutionClosure`
- `snapshotRendererConcreteIntegrationBoundaryExecutionDelivery`
- `snapshotRendererConcreteIntegrationBoundaryExecutionExport`
- `snapshotRendererConcreteIntegrationBoundaryFinalization`
- `snapshotRendererConcreteIntegrationBoundaryFinalizationExport`
- `snapshotRendererConcreteIntegrationBoundaryFinalizationHandoff`
- `snapshotRendererConcreteIntegrationBoundaryReleaseClosure`
- `snapshotRendererConcreteIntegrationBoundaryReleaseClosureExport`
- `snapshotRendererConcreteIntegrationBoundaryReleaseExport`
- `snapshotRendererConcreteIntegrationBoundaryRelease`
- `snapshotRendererConcreteIntegrationBoundaryPlan`
- `snapshotRendererIntegrationHandoff`
- `snapshotRendererMountReportConsumerDiagnosticDeliveryBundle`
- `snapshotRendererTargetMountBatchDiagnosticCatalog`
- `snapshotRendererTargetMountBatchDiagnostics`
- `snapshotRendererTargetMountIntegrationReadiness`
- `snapshotRendererTargetMountIntegrationReadinessCatalog`
- `snapshotRendererTargetMountIntegrationStatusHistory`
- `exportRendererTargetMountIntegrationReadinessCatalog`
- `exportRendererTargetMountIntegrationStatusHistory`
- `summarizeRendererTargetMountIntegrationStatus`
- `appendRendererTargetMountIntegrationStatusHistory`
- `summarizeRendererDomMountStore`
- `summarizeRendererMemoryMountStore`
- `summarizeRendererMountReports`
- `summarizeRendererMountReportConsumerDiagnosticAggregation`

Renderer currently depends on `@atlas/core` and keeps its public surface compact
while rendering contracts are defined. The package-root value and type surface
is protected by public API contract tests. Pipeline creation preserves the
ordered stage boundary without linking the resulting pipeline to later source
array mutations. Pipeline execution runs stages sequentially and reports their
stage results without defining component output or theme resolution. Empty
pipelines complete successfully, and asynchronous stages are awaited before the
next stage runs. Pipeline execution passes the same Renderer host context to
every stage, preserves stage result objects in completion order and rejects on
stage failures without running later stages. Renderer output currently captures
output kind, name and optional string content only. Output content is optional,
explicit empty content is preserved, and the current output kinds are
`fragment` and `document`. Outputs remain independent from targets, mounts,
adapters, platforms and render functions. Renderer targets currently capture
target kind, name and optional identifier only. Target identifiers are optional,
explicit empty identifiers are preserved, and the current target kinds are
`memory` and `surface`. Targets remain independent from outputs, adapters,
platforms and concrete surface elements. Renderer mount contracts currently
describe output-to-target requests and mount results without platform adapters,
DOM references, Home Assistant surfaces or side effects. Mount requests and
results keep references to existing output and target objects. Mount results
currently report only whether the output is mounted, together with the output
and target contract shapes, and optional explicit failure messages. Successful
mount results do not include failure messages. The memory mount adapter provides
the first concrete renderer usage path by recording output content against
memory targets while rejecting non-memory targets without mutating its store.
Memory mount records can be looked up by output and target metadata, memory
stores can be summarized for scenario assertions, and memory mount plans can be
executed through the shared renderer mount-plan executor with adapter strategy
semantics. Memory mount stores can be cleared in place, latest matching records
can be resolved for diagnostics, and mount results can be inspected alongside
store state for complete output-to-record scenario checks.
The DOM-like mount adapter records output HTML against `surface` target
identifiers, rejects memory targets, rejects surface targets without
identifiers and exposes lookup, latest-record, summary, clear, diagnostics and
plan-execution helpers without touching browser globals or Home Assistant APIs.
The default target mount routing layer now pairs Memory and DOM adapters in a
single registry, resolves `memory` targets to the Memory adapter, resolves
`surface` targets to the DOM adapter and executes output-to-target mounts
through one helper. Missing adapter entries and surface targets without
identifiers return stable unmounted results instead of mutating adapter stores.
Unified target mount executions can also be reported in one step, producing the
mount result, reported lifecycle record, diagnostic report and mount report from
the same Memory or DOM routing path.
Unified target mount batches execute ordered Memory and DOM requests through a
shared registry, preserve per-request registry overrides, continue across
routable failure results and summarize reported lifecycle records with the
existing mount report summary shape.
Batch reports can be consumed with the existing mount-report filters without
rerunning mounts, and failed batch executions can be selected by reference for
follow-up diagnostics.
Batch diagnostic closures summarize routed batch execution state into a compact
ready or blocked decision with total, mounted, failure and issue counts while
preserving references to the original execution and failed entries.
Batch diagnostic snapshots expose the closure decision and failed output or
target names as compact data, and diagnostic handoffs pair that snapshot with
the closure while marking only ready batches as transferable.
Batch diagnostic catalogs collect multiple diagnostic handoffs, preserve
handoff references, protect against later source-array mutation and summarize
handoff, ready, blocked and transferable counts for later integration layers.
Catalog snapshots compact those counts into ready or blocked catalog state, and
catalog exports preserve the catalog reference with an exportable signal only
when every collected handoff is ready.
Target mount integration readiness reviews exported catalogs into a clear
ready or blocked gate, carrying exportable state, handoff counts and stable
issues for empty, blocked or non-exportable exports.
Readiness snapshots compact the integration gate into counts and issue codes,
and readiness handoffs preserve the review reference while marking only ready
integration states as transferable.
Renderer adapters currently
describe a named mount contract that can return a mount result synchronously or
asynchronously. Adapter creation preserves mount handler references and remains
limited to name and mount contracts without platform, capability or registry
metadata. Adapter names are preserved for future registration, including
explicit empty names, and adapter mount handlers receive Renderer mount request
contracts directly while preserving output and target references in returned
mount results. Adapter mount results remain independent from adapter metadata.
Renderer adapter registries currently capture an ordered adapter list without
platform execution behavior. Empty adapter registries are supported as a valid
contract state before concrete adapter discovery is introduced. Registry
creation preserves adapter references and insertion order while protecting the
registry from later source-array mutations. Renderer adapter lookup contracts
currently describe lookup requests and results without executing adapter
selection or conflict resolution behavior. Lookup requests and results are
stable contract shapes, and lookup results may describe matched or missing
adapters while preserving matched adapter references. Renderer adapter registry
search currently finds the first adapter with a matching name and reports misses
without conflict resolution or adapter selection policies. Duplicate adapter
names currently resolve to the first matching adapter in registry order.
Renderer adapter conflicts currently describe duplicate-name adapter groups
without enforcing a resolution policy. Conflict creation preserves adapter
references, copies conflict adapter lists and preserves explicit empty conflict
names. Empty conflict adapter groups are supported as a valid contract state.
Renderer adapter conflict detection reports duplicate-name adapter groups from a
registry without selecting, reordering or resolving those adapters. Multiple
conflict groups follow first-duplicate registry order, while unique and empty
registries do not produce conflict reports. Renderer adapter conflict
resolution contracts can describe unresolved conflicts or explicitly selected
adapters, and resolution creation protects embedded conflict adapter lists from
later source-array mutations. Unresolved resolutions omit adapter fields.
First-candidate conflict resolution selects adapter references without invoking
mount handlers. Guarded mount execution invokes only resolved adapter choices;
unresolved resolutions return unmounted results, preserve request output and
target references, and do not invoke adapters even when an adapter field is
present. Rejected resolved adapter mounts preserve request output and target
references while reporting optional error messages. Renderer adapter selection
contracts describe candidate adapter selection requests and selected or
unselected results without automatic conflict policies. Empty selection
candidate lists are supported as a valid request state before policy helpers
exist. Selection requests preserve candidate adapter references while protecting
candidate lists from source-array mutation. Selection names, including explicit
empty names, remain plain string data. Selection results preserve selected
adapter references and omit adapter fields when unselected. Renderer now
includes an explicit first-candidate selection helper that selects the first
available candidate by reference or reports an unselected result without
resolving conflicts automatically. First-candidate selection preserves
candidate request order, does not invoke mount handlers and remains
disconnected from conflict integration. Renderer adapter conflicts can
now be resolved through first-candidate selection, while registry lookup,
platform mounting, Home Assistant cards, device targets and theme resolution
remain outside this integration boundary. Conflict integration preserves
conflict copy boundaries so later source-array mutations do not alter produced
resolutions. Renderer adapter registry conflicts can now be resolved through
first-candidate selection without executing platform mounting or changing
registry lookup behavior. Registry conflict resolutions preserve duplicate
conflict order from registry insertion order. Resolved adapter choices can now
drive guarded mount execution, while unresolved choices return an unmounted
result without invoking an adapter. Resolved adapter mounting supports
asynchronous adapter mount handlers before platform-specific adapters exist.
Rejected resolved adapter mounts return unmounted results with optional error
messages. Non-Error adapter mount rejections are stringified for stable failure
reporting. Renderer mount failures can now be inspected as Foundation-compatible
diagnostic reports without introducing platform-specific diagnostics. Successful
Renderer mount results now produce empty successful diagnostic reports, keeping
the diagnostics contract ready for future platform adapters. Renderer platform
adapter contracts now describe platform metadata, the underlying Renderer
adapter and declared capabilities without introducing concrete DOM, Home
Assistant card or device integration behavior. Platform adapter creation
remains limited to platform, adapter and capabilities fields, preserves the
underlying adapter reference, preserves explicit empty platform names and copies
capability lists at creation time. Empty capability lists remain a valid
contract state before concrete platform integrations exist. Renderer platform
adapter registries now capture ordered platform adapter lists without selection,
conflict handling or concrete integration execution. Empty platform adapter
registries are supported through the package root. Registry creation preserves
platform adapter references and insertion order while protecting registry lists
from later source-array mutation. Renderer platform adapter lookup contracts
now describe platform lookup requests and matched or missing platform adapter
results without executing selection or conflict resolution behavior. Platform
adapter lookup requests and results are protected through package-root copy
behavior, preserve explicit empty platform names and preserve matched platform
adapter references. Renderer platform adapter registry search now finds the
first platform adapter with a matching platform and reports misses without
selection, conflict handling or concrete platform execution. Missing lookup
results omit platformAdapter fields, and duplicate platform matches resolve to
the first registry entry. Platform adapter search is protected through the
package root and remains first-match behavior before conflict handling exists.
Renderer platform adapter conflicts now describe duplicate-platform adapter
groups without detecting or resolving those conflicts automatically. Empty
platform adapter conflict groups and explicit empty platform names are supported
through the package root, conflict lists remain copy-protected, and conflict
entries preserve their platform adapter references. Renderer platform adapter
conflict detection now reports duplicate-platform adapter groups from
registries without selecting, resolving or mounting those adapters. Multiple
conflict groups follow first-duplicate registry order, and unique or empty
platform adapter registries remain no-conflict states. Renderer platform
adapter conflict resolution contracts can now describe unresolved conflicts or
explicitly selected platform adapters without defining selection policies.
Unresolved resolutions omit platformAdapter fields, resolved resolutions
preserve selected platform adapter references, and embedded conflict lists stay
copy-protected. Renderer platform adapter selection contracts now describe
platform-specific candidate selection requests and selected or unselected
platform adapter results without automatic conflict policies. Selection requests
preserve platform adapter candidate references while protecting candidate lists
from source-array mutation. Empty platform adapter selection candidate lists are
supported as a valid request state, and explicit empty platform names remain
request data without normalization. Selection results preserve selected platform
adapter references, omit platformAdapter fields for unselected results and keep
explicit empty platform names as result data.
Renderer platform adapter first-candidate selection now selects the first
available platform adapter candidate or reports an unselected result without
resolving conflicts automatically. Platform adapter selection policy review
protects candidate order and confirms selection does not invoke platform
adapter mount handlers before conflict integration or guarded mounting.
Renderer platform adapter conflicts can now be resolved through first-candidate
selection without invoking selected platform adapter mount handlers, while
concrete mounting, Home Assistant cards, device targets and theme resolution
remain outside this integration boundary. Platform adapter conflict integration
preserves conflict copy boundaries so later source-array mutations do not alter
produced resolutions.
Renderer platform adapter registry conflicts can now be resolved through
first-candidate selection without executing concrete mounting or changing
registry lookup behavior. Registry conflict resolutions preserve duplicate
platform conflict order from registry insertion order.
Resolved platform adapter choices can now drive guarded mount execution through
their underlying Renderer adapter, while unresolved choices return an unmounted
result without invoking an adapter. Resolved platform adapter mounting supports
asynchronous adapter mount handlers before concrete integrations exist.
Unresolved guarded mount results preserve request output and target references
even if a platform adapter field is present on the resolution.
Rejected resolved platform adapter mounts return unmounted results with optional
error messages while preserving request output and target references. Non-Error
platform adapter mount rejections are stringified for stable failure reporting.
Platform adapter mount failures can now be inspected as Foundation-compatible
diagnostic reports without introducing concrete platform diagnostics. Failed
platform adapter mounts reuse the exported Renderer mount failure code, preserve
Error and string failure messages and report error severity. Successful platform
adapter mount results now produce empty successful diagnostic reports, and
unresolved guarded mount results without error messages remain successful
diagnostic reports. Platform adapter diagnostic reports stay at the
`renderer.mount` context, omit concrete platform metadata and are created as
independent report objects on each inspection, keeping diagnostics ready for
concrete integrations.
Renderer platform adapter contracts remain metadata-driven before concrete
integrations; platform names and capability lists do not trigger special DOM or
Home Assistant behavior inside Renderer. Home Assistant-style platform metadata
can move through platform adapter creation, registry storage, lookup, selection,
conflict resolution, guarded mounting and diagnostics as ordinary Renderer data.
Renderer does not export Home Assistant activation helpers, does not create
cards, dashboards or themes, and does not add concrete platform fields to mount
results or diagnostic reports.

Renderer mount planning describes the next output-to-target mounting capability
before concrete execution changes. Mount plans capture a request, strategy,
planned status and quality gates, copy quality gate lists away from caller-owned
arrays, report output and target names without executing adapter mount handlers,
and keep plans free of mounted state, adapter metadata, platform metadata, DOM
bindings, Home Assistant surfaces and Theme bindings.

Renderer mount plan execution can now route ready plans through existing
guarded adapter and platform-adapter resolution helpers. Manual plans remain
non-executing and return unmounted results, incomplete plans fail with stable
error messages, missing adapter resolutions are reported without invoking mount
handlers, and execution results remain ordinary `RendererMountResult` objects
without plan metadata, platform metadata, DOM bindings, Home Assistant surfaces
or Theme bindings.

Renderer mount lifecycle records now describe planned, executed and reported
mount work. Lifecycle records preserve plan, result and diagnostic report
references, can create reports from existing mount diagnostics, support
reporting before execution as a successful empty diagnostic state, and expose a
compact lifecycle inspection report without adding integration metadata, DOM
elements, Home Assistant fields or Theme fields.

Renderer mount reports now aggregate lifecycle records into compact reporting
shapes. Reports include plan strategy, output and target names, copied quality
gates, lifecycle flags, mounted status, diagnostics state and diagnostic issues.
Report summaries count planned, executed, reported, mounted, diagnostics-ok and
failed records without adding platform metadata, DOM elements, Home Assistant
fields or Theme fields.

Renderer mount report consumption now creates filtered report views from
lifecycle records. Consumption can filter by lifecycle state, mounted state and
diagnostics status, returns reports with a matching summary, and keeps source
arrays, DOM elements, Home Assistant fields, Theme fields and platform metadata
outside the reporting boundary.

Renderer mount report consumers now define a generic consumer integration point
for filtered consumption views. Consumers can synchronously or asynchronously
return consumed, failed and summary-bearing results, receive the consumption
view by reference, and remain independent from DOM elements, Home Assistant
fields, Theme fields and platform metadata.

Renderer mount report consumer registries now provide generic consumer lookup
and first-candidate selection. Registries and selection requests copy their
source arrays, lookup and selection preserve consumer references, and selection
does not invoke consumer handlers or add DOM, Home Assistant, Theme or platform
metadata.

Renderer mount report consumer registry conflicts now detect duplicate consumer
names, preserve conflicting consumer references, and resolve duplicates with
the existing first-candidate policy. Conflict detection and resolution do not
invoke consumer handlers or add DOM, Home Assistant, Theme or platform metadata.

Renderer mount report consumer diagnostics now inspect consumer results into a
stable diagnostics shape. Successful consumption is issue-free, unconsumed
results report a stable not-consumed code, consumer errors report a stable
failure code, and diagnostics remain independent from DOM elements, Home
Assistant fields, Theme fields and platform metadata.

Renderer mount report consumer diagnostic aggregation now combines multiple
consumer diagnostic reports into a stable aggregate result. Aggregations
preserve consumer order, copy report arrays away from caller-owned arrays,
collect issues across consumers, report empty aggregations as successful and
remain independent from DOM elements, Home Assistant fields, Theme fields and
platform metadata.

Renderer mount report consumer diagnostic aggregation summaries now derive
compact metrics from aggregate diagnostics. Summaries report aggregate ok
state, consumer count, successful consumer count, failed consumer count and
issue count without copying integration metadata into the summary surface.

Renderer mount report consumer diagnostic policy evaluation now derives a
small gate result from aggregation summaries. Policies can require every
consumer diagnostic report to be ok and can set a maximum aggregate issue
count, producing stable policy issue codes without adding DOM elements, Home
Assistant fields, Theme fields or platform metadata.

Renderer mount report consumer diagnostic execution now runs a consumer and
returns the consumer result with its diagnostic report. Rejected consumer
handlers are converted into stable unconsumed failure results, preserving the
consumption summary and keeping execution output free of DOM elements, Home
Assistant fields, Theme fields and platform metadata.

Renderer mount report consumer diagnostic batch execution now runs multiple
consumers into ordered diagnostic executions, aggregates their reports,
summarizes the aggregate and can evaluate an optional policy. Empty batches are
successful, consumer order is preserved and batch output remains independent
from DOM elements, Home Assistant fields, Theme fields and platform metadata.

Renderer mount report consumer diagnostic registry execution now delegates a
registry's ordered consumers through batch execution while preserving the
registry reference. Registry execution supports optional policy evaluation,
does not resolve conflicts or change lookup behavior, and remains independent
from DOM elements, Home Assistant fields, Theme fields and platform metadata.

Renderer mount report consumer diagnostic registry execution closure now
reviews registry executions into compact closure reports. Closure reports
include registry and execution counts, conflict counts, diagnostics state,
optional policy state and collected issues without resolving conflicts,
changing lookup behavior or adding integration metadata.

Renderer mount report consumer diagnostic delivery now packages registry
execution closures into a data-only delivery envelope. Deliveries expose a
stable kind, caller-provided name, ready state, issue count and closure
reference without adding transport, DOM, Home Assistant, Theme or platform
metadata.

Renderer mount report consumer diagnostic delivery manifests now group
multiple delivery envelopes into transport-neutral manifest data. Manifests
copy delivery lists, preserve delivery references, count ready and blocked
deliveries and total issue counts without adding DOM, Home Assistant, Theme or
platform metadata.

Renderer mount report consumer diagnostic delivery manifest closure now reviews
delivery manifests into compact closure reports. Manifest closures preserve the
manifest name, report delivery, ready, blocked and issue counts, collect issues
from delivery closures and remain data-only without transport or platform
metadata.

Renderer mount report consumer diagnostic delivery bundles now package manifest
closures into data-only bundle state. Bundles expose a stable kind,
caller-provided name, ready state, manifest count, issue count and copied
closure references without adding transport, DOM, Home Assistant, Theme or
platform metadata.

Renderer mount report consumer diagnostic delivery bundle snapshots now expose
compact data-only summaries of delivery bundles. Snapshots preserve bundle
name, ready state, manifest count, issue count and manifest names without
including closure payloads or integration metadata.

Renderer mount report consumer diagnostic delivery snapshot catalogs now group
bundle snapshots into transport-neutral catalog data. Catalogs copy snapshot
lists, preserve snapshot references, count ready and blocked snapshots and sum
issue counts without adding DOM, Home Assistant, Theme or platform metadata.

Renderer mount report consumer diagnostic delivery exports now package snapshot
catalogs into stable data-only export envelopes. Exports expose a stable kind,
caller-provided name, ready state, snapshot count, issue count and catalog
reference without adding transport behavior or integration metadata.

Renderer integration preparation now packages diagnostic delivery exports into
explicit preparation data. Preparations preserve delivery export references,
surface ready state and issue count, and keep transport, DOM, Home Assistant,
Theme and platform boundaries explicitly disabled before concrete integration
work begins.

Renderer integration readiness now reviews preparation data into a stable
readiness result. Readiness keeps blocked boundary names visible, carries
preparation issue counts forward and reports blocked preparations without
opening transport, DOM, Home Assistant, Theme or platform behavior.

Renderer integration handoffs now wrap readiness reviews in stable data-only
handoff envelopes. Handoffs preserve readiness references and carry ready state
and issue counts forward without adding transport, DOM, Home Assistant, Theme
or platform execution.

Renderer integration handoff snapshots now expose compact handoff summaries.
Snapshots preserve handoff names, ready state, issue counts and preparation
names while omitting readiness payloads and concrete integration metadata.

Renderer integration handoff snapshot catalogs now group compact handoff
snapshots with ready, blocked and issue counts. Catalogs copy the snapshot list
at creation time and remain free of concrete integration metadata.

Renderer concrete integration boundary reviews now evaluate handoff snapshot
catalogs into explicit ready state while keeping transport, DOM, Home
Assistant, Theme and platform boundaries closed before concrete integration
behavior is introduced.

Renderer concrete integration boundary decisions now derive first-open
candidate data from boundary reviews. Decisions carry candidate names and
selected boundaries only when ready, without creating handlers or concrete
surface bindings.

Renderer concrete integration boundary plans now wrap boundary decisions in
data-only preparation steps. Plans preserve selected boundary names when ready
and stay free of execution hooks or concrete surface bindings.

Renderer concrete integration boundary plan snapshots now expose compact plan
summaries with plan names, ready state, issue counts, step counts and planned
boundary names while omitting decision payloads.

Renderer concrete integration boundary plan snapshot catalogs now group compact
plan snapshots with copied snapshot lists and ready, blocked and issue counts
without retaining executable plan payloads.

Renderer concrete integration boundary execution preparations now derive
non-executable preparation state from boundary plan snapshot catalogs. Execution
preparation tracks prepared state, plan count and issue counts while explicitly
keeping execution disabled.

Renderer concrete integration boundary execution closures now summarize
execution preparations into closed, non-executable result state. Closures
preserve preparation references and plan counts without exposing execution
hooks or concrete surface bindings.

Renderer concrete integration boundary execution closure snapshots now expose
compact closure summaries with ready state, issue counts, plan counts and an
explicit non-executable flag while omitting preparation payloads.

Renderer concrete integration boundary execution closure snapshot catalogs now
group compact closure snapshots with ready, blocked, issue and executable
counts while keeping executable counts fixed at zero.

Renderer concrete integration boundary execution deliveries now wrap closure
snapshot catalogs in ready-state delivery envelopes while remaining explicitly
non-executable and free of concrete surface bindings.

Renderer concrete integration boundary execution delivery snapshots now expose
compact delivery summaries with ready state, issue counts, closure snapshot
counts and an explicit non-executable flag while omitting catalog payloads.

Renderer concrete integration boundary execution delivery snapshot catalogs now
group compact delivery snapshots with ready, blocked, issue and executable
counts while keeping executable counts fixed at zero.

Renderer concrete integration boundary execution exports now wrap delivery
snapshot catalogs in non-executable export envelopes with ready state and issue
counts.

Renderer concrete integration boundary execution export snapshots now expose
compact export summaries with ready state, issue counts, delivery snapshot
counts and an explicit non-executable flag while omitting catalog payloads.

Renderer concrete integration boundary execution export snapshot catalogs now
group compact export snapshots with ready, blocked, issue and executable counts
while keeping executable counts fixed at zero.

Renderer concrete integration boundary finalizations now wrap execution export
snapshot catalogs as finalized, non-executable boundary state with ready and
issue counts.

Renderer concrete integration boundary finalization snapshots now expose
compact finalization summaries with ready state, issue counts, export snapshot
counts and finalized, non-executable flags.

Renderer concrete integration boundary finalization snapshot catalogs now group
compact finalization snapshots with ready, blocked, issue and executable counts
while keeping executable counts fixed at zero.

Renderer concrete integration boundary finalization handoffs now wrap
finalization snapshot catalogs in finalized, non-executable handoff envelopes
with ready state and issue counts.

Renderer concrete integration boundary finalization handoff snapshots now expose
compact handoff summaries with ready state, issue counts, finalization snapshot
counts and finalized, non-executable flags.

Renderer concrete integration boundary finalization handoff snapshot catalogs
now group compact handoff snapshots with ready, blocked, issue and executable
counts while keeping executable counts fixed at zero.

Renderer concrete integration boundary finalization exports now wrap handoff
snapshot catalogs in finalized, non-executable export envelopes with ready state
and issue counts.

Renderer concrete integration boundary finalization export snapshots now expose
compact export summaries with ready state, issue counts, handoff snapshot counts
and finalized, non-executable flags.

Renderer concrete integration boundary finalization export snapshot catalogs now
group compact export snapshots with ready, blocked, issue and executable counts
while keeping executable counts fixed at zero.

Renderer concrete integration boundary releases now wrap finalization export
snapshot catalogs in released, non-executable release envelopes with ready state
and issue counts.

Renderer concrete integration boundary release snapshots now expose compact
release summaries with ready state, issue counts, snapshot counts and released,
non-executable flags.

Renderer concrete integration boundary release snapshot catalogs now group
compact release snapshots with ready, blocked, issue and executable counts while
keeping executable counts fixed at zero.

Renderer concrete integration boundary release exports now wrap release snapshot
catalogs in exported, non-executable envelopes with ready state and issue
counts.

Renderer concrete integration boundary release export snapshots now expose
compact export summaries with ready state, issue counts, release snapshot counts
and exported, non-executable flags.

Renderer concrete integration boundary release export snapshot catalogs now
group compact export snapshots with ready, blocked, issue and executable counts
while keeping executable counts fixed at zero.

Renderer concrete integration boundary release closures now wrap release export
snapshot catalogs in closed, non-executable closure envelopes with ready state
and issue counts.

Renderer concrete integration boundary release closure snapshots now expose
compact closure summaries with ready state, issue counts, export snapshot counts
and closed, non-executable flags.

Renderer concrete integration boundary release closure snapshot catalogs now
group compact closure snapshots with ready, blocked, issue and executable counts
while keeping executable counts fixed at zero.

Renderer concrete integration boundary release closure exports now wrap closure
snapshot catalogs in exported, non-executable envelopes with ready state and
issue counts.

Renderer concrete integration boundary release closure export snapshots now
expose compact export summaries with ready state, issue counts, closure snapshot
counts and exported, non-executable flags.

Renderer concrete integration boundary release closure export snapshot catalogs
now group compact export snapshots with ready, blocked, issue and executable
counts while keeping executable counts fixed at zero.

Renderer concrete integration boundary release closure deliveries now wrap
closure export snapshot catalogs in delivered, non-executable envelopes with
ready state and issue counts.

Renderer host contexts remain thin references to Core Runtime hosts. Renderer
does not clone, wrap or reclassify Runtime state, diagnostics, events or
lifecycle behavior; pipelines receive the same Core Runtime host reference that
was used to create the context.

---

# Build Output

Compiled artifacts are emitted to `dist`.

Source files remain under `src`.
