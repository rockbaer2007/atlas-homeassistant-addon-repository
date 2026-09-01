import type { RendererMountReportConsumption } from "./RendererMountReporting";
export declare const RendererMountReportConsumerDiagnosticCodes: {
    readonly NotConsumed: "renderer.mount.report.consumer.not_consumed";
    readonly ConsumerFailed: "renderer.mount.report.consumer.failed";
};
export declare const RendererMountReportConsumerDiagnosticPolicyCodes: {
    readonly ConsumerDiagnosticsFailed: "renderer.mount.report.consumer.diagnostics.policy.consumer_failed";
    readonly IssueLimitExceeded: "renderer.mount.report.consumer.diagnostics.policy.issue_limit_exceeded";
};
export type RendererMountReportConsumerDiagnosticReport = Readonly<{
    context: Readonly<{
        component: string;
        consumerName: string;
    }>;
    result: Readonly<{
        ok: boolean;
        issues: readonly Readonly<{
            code: string;
            message: string;
            severity: "error";
        }>[];
    }>;
}>;
export type RendererMountReportConsumerDiagnosticAggregation = Readonly<{
    context: Readonly<{
        component: string;
        consumerNames: readonly string[];
    }>;
    result: Readonly<{
        ok: boolean;
        reports: readonly RendererMountReportConsumerDiagnosticReport[];
        issues: readonly RendererMountReportConsumerDiagnosticReport["result"]["issues"][number][];
    }>;
}>;
export type RendererMountReportConsumerDiagnosticAggregationSummary = Readonly<{
    ok: boolean;
    consumerCount: number;
    okConsumerCount: number;
    failedConsumerCount: number;
    issueCount: number;
}>;
export type RendererMountReportConsumerDiagnosticPolicy = Readonly<{
    requireAllConsumersOk?: boolean;
    maxIssueCount?: number;
}>;
export type RendererMountReportConsumerDiagnosticPolicyEvaluation = Readonly<{
    context: Readonly<{
        component: string;
    }>;
    result: Readonly<{
        ok: boolean;
        summary: RendererMountReportConsumerDiagnosticAggregationSummary;
        issues: readonly Readonly<{
            code: string;
            message: string;
            severity: "error";
        }>[];
    }>;
}>;
export type RendererMountReportConsumerDiagnosticExecution = Readonly<{
    consumerName: string;
    result: RendererMountReportConsumerResult;
    diagnostic: RendererMountReportConsumerDiagnosticReport;
}>;
export type RendererMountReportConsumerDiagnosticBatchExecution = Readonly<{
    executions: readonly RendererMountReportConsumerDiagnosticExecution[];
    aggregation: RendererMountReportConsumerDiagnosticAggregation;
    summary: RendererMountReportConsumerDiagnosticAggregationSummary;
    policyEvaluation?: RendererMountReportConsumerDiagnosticPolicyEvaluation;
}>;
export type RendererMountReportConsumerDiagnosticRegistryExecution = Readonly<{
    registry: RendererMountReportConsumerRegistry;
    batch: RendererMountReportConsumerDiagnosticBatchExecution;
}>;
export type RendererMountReportConsumerDiagnosticRegistryExecutionClosure = Readonly<{
    context: Readonly<{
        component: string;
    }>;
    result: Readonly<{
        ok: boolean;
        registryConsumerCount: number;
        executedConsumerCount: number;
        conflictCount: number;
        diagnosticsOk: boolean;
        policyOk?: boolean;
        issues: readonly Readonly<{
            code: string;
            message: string;
            severity: "error";
        }>[];
    }>;
}>;
export type RendererMountReportConsumerDiagnosticDelivery = Readonly<{
    kind: "renderer.mount.report.consumer.diagnostics.delivery";
    name: string;
    ready: boolean;
    issueCount: number;
    closure: RendererMountReportConsumerDiagnosticRegistryExecutionClosure;
}>;
export type RendererMountReportConsumerDiagnosticDeliveryManifest = Readonly<{
    kind: "renderer.mount.report.consumer.diagnostics.delivery.manifest";
    name: string;
    deliveries: readonly RendererMountReportConsumerDiagnosticDelivery[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
}>;
export type RendererMountReportConsumerDiagnosticDeliveryManifestClosure = Readonly<{
    context: Readonly<{
        component: string;
        manifestName: string;
    }>;
    result: Readonly<{
        ok: boolean;
        deliveryCount: number;
        readyCount: number;
        blockedCount: number;
        issueCount: number;
        issues: readonly RendererMountReportConsumerDiagnosticRegistryExecutionClosure["result"]["issues"][number][];
    }>;
}>;
export type RendererMountReportConsumerDiagnosticDeliveryBundle = Readonly<{
    kind: "renderer.mount.report.consumer.diagnostics.delivery.bundle";
    name: string;
    ready: boolean;
    manifestCount: number;
    issueCount: number;
    closures: readonly RendererMountReportConsumerDiagnosticDeliveryManifestClosure[];
}>;
export type RendererMountReportConsumerDiagnosticDeliveryBundleSnapshot = Readonly<{
    kind: "renderer.mount.report.consumer.diagnostics.delivery.bundle.snapshot";
    bundleName: string;
    ready: boolean;
    manifestCount: number;
    issueCount: number;
    manifestNames: readonly string[];
}>;
export type RendererMountReportConsumerDiagnosticDeliverySnapshotCatalog = Readonly<{
    kind: "renderer.mount.report.consumer.diagnostics.delivery.snapshot.catalog";
    name: string;
    snapshots: readonly RendererMountReportConsumerDiagnosticDeliveryBundleSnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
}>;
export type RendererMountReportConsumerDiagnosticDeliveryExport = Readonly<{
    kind: "renderer.mount.report.consumer.diagnostics.delivery.export";
    name: string;
    ready: boolean;
    snapshotCount: number;
    issueCount: number;
    catalog: RendererMountReportConsumerDiagnosticDeliverySnapshotCatalog;
}>;
export type RendererIntegrationPreparation = Readonly<{
    kind: "renderer.integration.preparation";
    name: string;
    ready: boolean;
    issueCount: number;
    deliveryExport: RendererMountReportConsumerDiagnosticDeliveryExport;
    boundaries: Readonly<{
        transport: false;
        dom: false;
        homeAssistant: false;
        theme: false;
        platform: false;
    }>;
}>;
export type RendererIntegrationReadiness = Readonly<{
    context: Readonly<{
        component: "renderer.integration";
        preparationName: string;
    }>;
    result: Readonly<{
        ready: boolean;
        issueCount: number;
        blockedBoundaries: readonly string[];
        issues: readonly Readonly<{
            code: "renderer.integration.preparation.not_ready";
            message: string;
            severity: "error";
        }>[];
    }>;
}>;
export type RendererIntegrationHandoff = Readonly<{
    kind: "renderer.integration.handoff";
    name: string;
    ready: boolean;
    issueCount: number;
    readiness: RendererIntegrationReadiness;
}>;
export type RendererIntegrationHandoffSnapshot = Readonly<{
    kind: "renderer.integration.handoff.snapshot";
    handoffName: string;
    ready: boolean;
    issueCount: number;
    preparationName: string;
}>;
export type RendererIntegrationHandoffSnapshotCatalog = Readonly<{
    kind: "renderer.integration.handoff.snapshot.catalog";
    name: string;
    snapshots: readonly RendererIntegrationHandoffSnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
}>;
export type RendererConcreteIntegrationBoundaryReview = Readonly<{
    kind: "renderer.concrete.integration.boundary.review";
    name: string;
    ready: boolean;
    issueCount: number;
    catalog: RendererIntegrationHandoffSnapshotCatalog;
    boundaries: Readonly<{
        transport: false;
        dom: false;
        homeAssistant: false;
        theme: false;
        platform: false;
    }>;
}>;
export type RendererConcreteIntegrationBoundaryDecision = Readonly<{
    kind: "renderer.concrete.integration.boundary.decision";
    name: string;
    ready: boolean;
    issueCount: number;
    review: RendererConcreteIntegrationBoundaryReview;
    candidates: readonly string[];
    selectedBoundary?: string;
}>;
export type RendererConcreteIntegrationBoundaryPlan = Readonly<{
    kind: "renderer.concrete.integration.boundary.plan";
    name: string;
    ready: boolean;
    issueCount: number;
    decision: RendererConcreteIntegrationBoundaryDecision;
    steps: readonly string[];
    plannedBoundary?: string;
}>;
export type RendererConcreteIntegrationBoundaryPlanSnapshot = Readonly<{
    kind: "renderer.concrete.integration.boundary.plan.snapshot";
    planName: string;
    ready: boolean;
    issueCount: number;
    stepCount: number;
    plannedBoundary?: string;
}>;
export type RendererConcreteIntegrationBoundaryPlanSnapshotCatalog = Readonly<{
    kind: "renderer.concrete.integration.boundary.plan.snapshot.catalog";
    name: string;
    snapshots: readonly RendererConcreteIntegrationBoundaryPlanSnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
}>;
export type RendererConcreteIntegrationBoundaryExecutionPreparation = Readonly<{
    kind: "renderer.concrete.integration.boundary.execution.preparation";
    name: string;
    ready: boolean;
    issueCount: number;
    catalog: RendererConcreteIntegrationBoundaryPlanSnapshotCatalog;
    execution: Readonly<{
        prepared: boolean;
        executable: false;
        planCount: number;
    }>;
}>;
export type RendererConcreteIntegrationBoundaryExecutionClosure = Readonly<{
    kind: "renderer.concrete.integration.boundary.execution.closure";
    name: string;
    ready: boolean;
    issueCount: number;
    preparation: RendererConcreteIntegrationBoundaryExecutionPreparation;
    result: Readonly<{
        closed: true;
        executable: false;
        planCount: number;
    }>;
}>;
export type RendererConcreteIntegrationBoundaryExecutionClosureSnapshot = Readonly<{
    kind: "renderer.concrete.integration.boundary.execution.closure.snapshot";
    closureName: string;
    ready: boolean;
    issueCount: number;
    planCount: number;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryExecutionClosureSnapshotCatalog = Readonly<{
    kind: "renderer.concrete.integration.boundary.execution.closure.snapshot.catalog";
    name: string;
    snapshots: readonly RendererConcreteIntegrationBoundaryExecutionClosureSnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
    executableCount: 0;
}>;
export type RendererConcreteIntegrationBoundaryExecutionDelivery = Readonly<{
    kind: "renderer.concrete.integration.boundary.execution.delivery";
    name: string;
    ready: boolean;
    issueCount: number;
    catalog: RendererConcreteIntegrationBoundaryExecutionClosureSnapshotCatalog;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryExecutionDeliverySnapshot = Readonly<{
    kind: "renderer.concrete.integration.boundary.execution.delivery.snapshot";
    deliveryName: string;
    ready: boolean;
    issueCount: number;
    closureSnapshotCount: number;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryExecutionDeliverySnapshotCatalog = Readonly<{
    kind: "renderer.concrete.integration.boundary.execution.delivery.snapshot.catalog";
    name: string;
    snapshots: readonly RendererConcreteIntegrationBoundaryExecutionDeliverySnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
    executableCount: 0;
}>;
export type RendererConcreteIntegrationBoundaryExecutionExport = Readonly<{
    kind: "renderer.concrete.integration.boundary.execution.export";
    name: string;
    ready: boolean;
    issueCount: number;
    catalog: RendererConcreteIntegrationBoundaryExecutionDeliverySnapshotCatalog;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryExecutionExportSnapshot = Readonly<{
    kind: "renderer.concrete.integration.boundary.execution.export.snapshot";
    exportName: string;
    ready: boolean;
    issueCount: number;
    deliverySnapshotCount: number;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryExecutionExportSnapshotCatalog = Readonly<{
    kind: "renderer.concrete.integration.boundary.execution.export.snapshot.catalog";
    name: string;
    snapshots: readonly RendererConcreteIntegrationBoundaryExecutionExportSnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
    executableCount: 0;
}>;
export type RendererConcreteIntegrationBoundaryFinalization = Readonly<{
    kind: "renderer.concrete.integration.boundary.finalization";
    name: string;
    ready: boolean;
    issueCount: number;
    catalog: RendererConcreteIntegrationBoundaryExecutionExportSnapshotCatalog;
    finalized: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryFinalizationSnapshot = Readonly<{
    kind: "renderer.concrete.integration.boundary.finalization.snapshot";
    finalizationName: string;
    ready: boolean;
    issueCount: number;
    exportSnapshotCount: number;
    finalized: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryFinalizationSnapshotCatalog = Readonly<{
    kind: "renderer.concrete.integration.boundary.finalization.snapshot.catalog";
    name: string;
    snapshots: readonly RendererConcreteIntegrationBoundaryFinalizationSnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
    executableCount: 0;
}>;
export type RendererConcreteIntegrationBoundaryFinalizationHandoff = Readonly<{
    kind: "renderer.concrete.integration.boundary.finalization.handoff";
    name: string;
    ready: boolean;
    issueCount: number;
    catalog: RendererConcreteIntegrationBoundaryFinalizationSnapshotCatalog;
    finalized: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshot = Readonly<{
    kind: "renderer.concrete.integration.boundary.finalization.handoff.snapshot";
    handoffName: string;
    ready: boolean;
    issueCount: number;
    finalizationSnapshotCount: number;
    finalized: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshotCatalog = Readonly<{
    kind: "renderer.concrete.integration.boundary.finalization.handoff.snapshot.catalog";
    name: string;
    snapshots: readonly RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
    executableCount: 0;
}>;
export type RendererConcreteIntegrationBoundaryFinalizationExport = Readonly<{
    kind: "renderer.concrete.integration.boundary.finalization.export";
    name: string;
    ready: boolean;
    issueCount: number;
    catalog: RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshotCatalog;
    finalized: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryFinalizationExportSnapshot = Readonly<{
    kind: "renderer.concrete.integration.boundary.finalization.export.snapshot";
    exportName: string;
    ready: boolean;
    issueCount: number;
    handoffSnapshotCount: number;
    finalized: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryFinalizationExportSnapshotCatalog = Readonly<{
    kind: "renderer.concrete.integration.boundary.finalization.export.snapshot.catalog";
    name: string;
    snapshots: readonly RendererConcreteIntegrationBoundaryFinalizationExportSnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
    executableCount: 0;
}>;
export type RendererConcreteIntegrationBoundaryRelease = Readonly<{
    kind: "renderer.concrete.integration.boundary.release";
    name: string;
    ready: boolean;
    issueCount: number;
    catalog: RendererConcreteIntegrationBoundaryFinalizationExportSnapshotCatalog;
    released: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryReleaseSnapshot = Readonly<{
    kind: "renderer.concrete.integration.boundary.release.snapshot";
    releaseName: string;
    ready: boolean;
    issueCount: number;
    snapshotCount: number;
    released: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryReleaseSnapshotCatalog = Readonly<{
    kind: "renderer.concrete.integration.boundary.release.snapshot.catalog";
    name: string;
    snapshots: readonly RendererConcreteIntegrationBoundaryReleaseSnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
    executableCount: 0;
}>;
export type RendererConcreteIntegrationBoundaryReleaseExport = Readonly<{
    kind: "renderer.concrete.integration.boundary.release.export";
    name: string;
    ready: boolean;
    issueCount: number;
    catalog: RendererConcreteIntegrationBoundaryReleaseSnapshotCatalog;
    exported: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryReleaseExportSnapshot = Readonly<{
    kind: "renderer.concrete.integration.boundary.release.export.snapshot";
    exportName: string;
    ready: boolean;
    issueCount: number;
    releaseSnapshotCount: number;
    exported: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryReleaseExportSnapshotCatalog = Readonly<{
    kind: "renderer.concrete.integration.boundary.release.export.snapshot.catalog";
    name: string;
    snapshots: readonly RendererConcreteIntegrationBoundaryReleaseExportSnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
    executableCount: 0;
}>;
export type RendererConcreteIntegrationBoundaryReleaseClosure = Readonly<{
    kind: "renderer.concrete.integration.boundary.release.closure";
    name: string;
    ready: boolean;
    issueCount: number;
    catalog: RendererConcreteIntegrationBoundaryReleaseExportSnapshotCatalog;
    closed: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryReleaseClosureSnapshot = Readonly<{
    kind: "renderer.concrete.integration.boundary.release.closure.snapshot";
    closureName: string;
    ready: boolean;
    issueCount: number;
    exportSnapshotCount: number;
    closed: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryReleaseClosureSnapshotCatalog = Readonly<{
    kind: "renderer.concrete.integration.boundary.release.closure.snapshot.catalog";
    name: string;
    snapshots: readonly RendererConcreteIntegrationBoundaryReleaseClosureSnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
    executableCount: 0;
}>;
export type RendererConcreteIntegrationBoundaryReleaseClosureExport = Readonly<{
    kind: "renderer.concrete.integration.boundary.release.closure.export";
    name: string;
    ready: boolean;
    issueCount: number;
    catalog: RendererConcreteIntegrationBoundaryReleaseClosureSnapshotCatalog;
    exported: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshot = Readonly<{
    kind: "renderer.concrete.integration.boundary.release.closure.export.snapshot";
    exportName: string;
    ready: boolean;
    issueCount: number;
    closureSnapshotCount: number;
    exported: true;
    executable: false;
}>;
export type RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshotCatalog = Readonly<{
    kind: "renderer.concrete.integration.boundary.release.closure.export.snapshot.catalog";
    name: string;
    snapshots: readonly RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshot[];
    readyCount: number;
    blockedCount: number;
    issueCount: number;
    executableCount: 0;
}>;
export type RendererConcreteIntegrationBoundaryReleaseClosureDelivery = Readonly<{
    kind: "renderer.concrete.integration.boundary.release.closure.delivery";
    name: string;
    ready: boolean;
    issueCount: number;
    catalog: RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshotCatalog;
    delivered: true;
    executable: false;
}>;
export type RendererMountReportConsumerResult = Readonly<{
    consumerName: string;
    consumed: boolean;
    summary: RendererMountReportConsumption["summary"];
    error?: string;
}>;
export type RendererMountReportConsumerOutput = RendererMountReportConsumerResult | Promise<RendererMountReportConsumerResult>;
export type RendererMountReportConsumer = Readonly<{
    name: string;
    consume(consumption: RendererMountReportConsumption): RendererMountReportConsumerOutput;
}>;
export type RendererMountReportConsumerRegistry = Readonly<{
    consumers: readonly RendererMountReportConsumer[];
}>;
export type RendererMountReportConsumerLookupRequest = Readonly<{
    name: string;
}>;
export type RendererMountReportConsumerLookupResult = Readonly<{
    name: string;
    consumer?: RendererMountReportConsumer;
}>;
export type RendererMountReportConsumerSelectionRequest = Readonly<{
    name: string;
    candidates: readonly RendererMountReportConsumer[];
}>;
export type RendererMountReportConsumerSelectionResult = Readonly<{
    name: string;
    consumer?: RendererMountReportConsumer;
}>;
export type RendererMountReportConsumerConflict = Readonly<{
    name: string;
    consumers: readonly RendererMountReportConsumer[];
}>;
export type RendererMountReportConsumerConflictResolution = Readonly<{
    conflict: RendererMountReportConsumerConflict;
    resolved: boolean;
    consumer?: RendererMountReportConsumer;
}>;
export declare function createRendererMountReportConsumer(consumer: RendererMountReportConsumer): RendererMountReportConsumer;
export declare function createRendererMountReportConsumerRegistry(consumers: readonly RendererMountReportConsumer[]): RendererMountReportConsumerRegistry;
export declare function createRendererMountReportConsumerLookupRequest(request: RendererMountReportConsumerLookupRequest): RendererMountReportConsumerLookupRequest;
export declare function createRendererMountReportConsumerLookupResult(result: RendererMountReportConsumerLookupResult): RendererMountReportConsumerLookupResult;
export declare function createRendererMountReportConsumerSelectionRequest(request: RendererMountReportConsumerSelectionRequest): RendererMountReportConsumerSelectionRequest;
export declare function createRendererMountReportConsumerSelectionResult(result: RendererMountReportConsumerSelectionResult): RendererMountReportConsumerSelectionResult;
export declare function createRendererMountReportConsumerConflict(conflict: RendererMountReportConsumerConflict): RendererMountReportConsumerConflict;
export declare function createRendererMountReportConsumerConflictResolution(resolution: RendererMountReportConsumerConflictResolution): RendererMountReportConsumerConflictResolution;
export declare function findRendererMountReportConsumer(registry: RendererMountReportConsumerRegistry, request: RendererMountReportConsumerLookupRequest): RendererMountReportConsumerLookupResult;
export declare function findRendererMountReportConsumerConflicts(registry: RendererMountReportConsumerRegistry): readonly RendererMountReportConsumerConflict[];
export declare function selectFirstRendererMountReportConsumerCandidate(request: RendererMountReportConsumerSelectionRequest): RendererMountReportConsumerSelectionResult;
export declare function resolveRendererMountReportConsumerConflictWithFirstCandidate(conflict: RendererMountReportConsumerConflict): RendererMountReportConsumerConflictResolution;
export declare function resolveRendererMountReportConsumerRegistryConflictsWithFirstCandidate(registry: RendererMountReportConsumerRegistry): readonly RendererMountReportConsumerConflictResolution[];
export declare function consumeRendererMountReports(consumer: RendererMountReportConsumer, consumption: RendererMountReportConsumption): Promise<RendererMountReportConsumerResult>;
export declare function consumeAndInspectRendererMountReports(consumer: RendererMountReportConsumer, consumption: RendererMountReportConsumption): Promise<RendererMountReportConsumerDiagnosticExecution>;
export declare function consumeAndInspectRendererMountReportConsumers(consumers: readonly RendererMountReportConsumer[], consumption: RendererMountReportConsumption, policy?: RendererMountReportConsumerDiagnosticPolicy): Promise<RendererMountReportConsumerDiagnosticBatchExecution>;
export declare function consumeAndInspectRendererMountReportConsumerRegistry(registry: RendererMountReportConsumerRegistry, consumption: RendererMountReportConsumption, policy?: RendererMountReportConsumerDiagnosticPolicy): Promise<RendererMountReportConsumerDiagnosticRegistryExecution>;
export declare function reviewRendererMountReportConsumerDiagnosticRegistryExecution(execution: RendererMountReportConsumerDiagnosticRegistryExecution): RendererMountReportConsumerDiagnosticRegistryExecutionClosure;
export declare function createRendererMountReportConsumerDiagnosticDelivery(name: string, closure: RendererMountReportConsumerDiagnosticRegistryExecutionClosure): RendererMountReportConsumerDiagnosticDelivery;
export declare function createRendererMountReportConsumerDiagnosticDeliveryManifest(name: string, deliveries: readonly RendererMountReportConsumerDiagnosticDelivery[]): RendererMountReportConsumerDiagnosticDeliveryManifest;
export declare function reviewRendererMountReportConsumerDiagnosticDeliveryManifest(manifest: RendererMountReportConsumerDiagnosticDeliveryManifest): RendererMountReportConsumerDiagnosticDeliveryManifestClosure;
export declare function createRendererMountReportConsumerDiagnosticDeliveryBundle(name: string, closures: readonly RendererMountReportConsumerDiagnosticDeliveryManifestClosure[]): RendererMountReportConsumerDiagnosticDeliveryBundle;
export declare function snapshotRendererMountReportConsumerDiagnosticDeliveryBundle(bundle: RendererMountReportConsumerDiagnosticDeliveryBundle): RendererMountReportConsumerDiagnosticDeliveryBundleSnapshot;
export declare function createRendererMountReportConsumerDiagnosticDeliverySnapshotCatalog(name: string, snapshots: readonly RendererMountReportConsumerDiagnosticDeliveryBundleSnapshot[]): RendererMountReportConsumerDiagnosticDeliverySnapshotCatalog;
export declare function createRendererMountReportConsumerDiagnosticDeliveryExport(name: string, catalog: RendererMountReportConsumerDiagnosticDeliverySnapshotCatalog): RendererMountReportConsumerDiagnosticDeliveryExport;
export declare function createRendererIntegrationPreparation(name: string, deliveryExport: RendererMountReportConsumerDiagnosticDeliveryExport): RendererIntegrationPreparation;
export declare function reviewRendererIntegrationPreparationReadiness(preparation: RendererIntegrationPreparation): RendererIntegrationReadiness;
export declare function createRendererIntegrationHandoff(name: string, readiness: RendererIntegrationReadiness): RendererIntegrationHandoff;
export declare function snapshotRendererIntegrationHandoff(handoff: RendererIntegrationHandoff): RendererIntegrationHandoffSnapshot;
export declare function createRendererIntegrationHandoffSnapshotCatalog(name: string, snapshots: readonly RendererIntegrationHandoffSnapshot[]): RendererIntegrationHandoffSnapshotCatalog;
export declare function reviewRendererConcreteIntegrationBoundary(name: string, catalog: RendererIntegrationHandoffSnapshotCatalog): RendererConcreteIntegrationBoundaryReview;
export declare function createRendererConcreteIntegrationBoundaryDecision(name: string, review: RendererConcreteIntegrationBoundaryReview): RendererConcreteIntegrationBoundaryDecision;
export declare function createRendererConcreteIntegrationBoundaryPlan(name: string, decision: RendererConcreteIntegrationBoundaryDecision): RendererConcreteIntegrationBoundaryPlan;
export declare function snapshotRendererConcreteIntegrationBoundaryPlan(plan: RendererConcreteIntegrationBoundaryPlan): RendererConcreteIntegrationBoundaryPlanSnapshot;
export declare function createRendererConcreteIntegrationBoundaryPlanSnapshotCatalog(name: string, snapshots: readonly RendererConcreteIntegrationBoundaryPlanSnapshot[]): RendererConcreteIntegrationBoundaryPlanSnapshotCatalog;
export declare function prepareRendererConcreteIntegrationBoundaryExecution(name: string, catalog: RendererConcreteIntegrationBoundaryPlanSnapshotCatalog): RendererConcreteIntegrationBoundaryExecutionPreparation;
export declare function closeRendererConcreteIntegrationBoundaryExecution(name: string, preparation: RendererConcreteIntegrationBoundaryExecutionPreparation): RendererConcreteIntegrationBoundaryExecutionClosure;
export declare function snapshotRendererConcreteIntegrationBoundaryExecutionClosure(closure: RendererConcreteIntegrationBoundaryExecutionClosure): RendererConcreteIntegrationBoundaryExecutionClosureSnapshot;
export declare function createRendererConcreteIntegrationBoundaryExecutionClosureSnapshotCatalog(name: string, snapshots: readonly RendererConcreteIntegrationBoundaryExecutionClosureSnapshot[]): RendererConcreteIntegrationBoundaryExecutionClosureSnapshotCatalog;
export declare function createRendererConcreteIntegrationBoundaryExecutionDelivery(name: string, catalog: RendererConcreteIntegrationBoundaryExecutionClosureSnapshotCatalog): RendererConcreteIntegrationBoundaryExecutionDelivery;
export declare function snapshotRendererConcreteIntegrationBoundaryExecutionDelivery(delivery: RendererConcreteIntegrationBoundaryExecutionDelivery): RendererConcreteIntegrationBoundaryExecutionDeliverySnapshot;
export declare function createRendererConcreteIntegrationBoundaryExecutionDeliverySnapshotCatalog(name: string, snapshots: readonly RendererConcreteIntegrationBoundaryExecutionDeliverySnapshot[]): RendererConcreteIntegrationBoundaryExecutionDeliverySnapshotCatalog;
export declare function createRendererConcreteIntegrationBoundaryExecutionExport(name: string, catalog: RendererConcreteIntegrationBoundaryExecutionDeliverySnapshotCatalog): RendererConcreteIntegrationBoundaryExecutionExport;
export declare function snapshotRendererConcreteIntegrationBoundaryExecutionExport(executionExport: RendererConcreteIntegrationBoundaryExecutionExport): RendererConcreteIntegrationBoundaryExecutionExportSnapshot;
export declare function createRendererConcreteIntegrationBoundaryExecutionExportSnapshotCatalog(name: string, snapshots: readonly RendererConcreteIntegrationBoundaryExecutionExportSnapshot[]): RendererConcreteIntegrationBoundaryExecutionExportSnapshotCatalog;
export declare function finalizeRendererConcreteIntegrationBoundary(name: string, catalog: RendererConcreteIntegrationBoundaryExecutionExportSnapshotCatalog): RendererConcreteIntegrationBoundaryFinalization;
export declare function snapshotRendererConcreteIntegrationBoundaryFinalization(finalization: RendererConcreteIntegrationBoundaryFinalization): RendererConcreteIntegrationBoundaryFinalizationSnapshot;
export declare function createRendererConcreteIntegrationBoundaryFinalizationSnapshotCatalog(name: string, snapshots: readonly RendererConcreteIntegrationBoundaryFinalizationSnapshot[]): RendererConcreteIntegrationBoundaryFinalizationSnapshotCatalog;
export declare function createRendererConcreteIntegrationBoundaryFinalizationHandoff(name: string, catalog: RendererConcreteIntegrationBoundaryFinalizationSnapshotCatalog): RendererConcreteIntegrationBoundaryFinalizationHandoff;
export declare function snapshotRendererConcreteIntegrationBoundaryFinalizationHandoff(handoff: RendererConcreteIntegrationBoundaryFinalizationHandoff): RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshot;
export declare function createRendererConcreteIntegrationBoundaryFinalizationHandoffSnapshotCatalog(name: string, snapshots: readonly RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshot[]): RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshotCatalog;
export declare function createRendererConcreteIntegrationBoundaryFinalizationExport(name: string, catalog: RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshotCatalog): RendererConcreteIntegrationBoundaryFinalizationExport;
export declare function snapshotRendererConcreteIntegrationBoundaryFinalizationExport(finalizationExport: RendererConcreteIntegrationBoundaryFinalizationExport): RendererConcreteIntegrationBoundaryFinalizationExportSnapshot;
export declare function createRendererConcreteIntegrationBoundaryFinalizationExportSnapshotCatalog(name: string, snapshots: readonly RendererConcreteIntegrationBoundaryFinalizationExportSnapshot[]): RendererConcreteIntegrationBoundaryFinalizationExportSnapshotCatalog;
export declare function createRendererConcreteIntegrationBoundaryRelease(name: string, catalog: RendererConcreteIntegrationBoundaryFinalizationExportSnapshotCatalog): RendererConcreteIntegrationBoundaryRelease;
export declare function snapshotRendererConcreteIntegrationBoundaryRelease(release: RendererConcreteIntegrationBoundaryRelease): RendererConcreteIntegrationBoundaryReleaseSnapshot;
export declare function createRendererConcreteIntegrationBoundaryReleaseSnapshotCatalog(name: string, snapshots: readonly RendererConcreteIntegrationBoundaryReleaseSnapshot[]): RendererConcreteIntegrationBoundaryReleaseSnapshotCatalog;
export declare function createRendererConcreteIntegrationBoundaryReleaseExport(name: string, catalog: RendererConcreteIntegrationBoundaryReleaseSnapshotCatalog): RendererConcreteIntegrationBoundaryReleaseExport;
export declare function snapshotRendererConcreteIntegrationBoundaryReleaseExport(releaseExport: RendererConcreteIntegrationBoundaryReleaseExport): RendererConcreteIntegrationBoundaryReleaseExportSnapshot;
export declare function createRendererConcreteIntegrationBoundaryReleaseExportSnapshotCatalog(name: string, snapshots: readonly RendererConcreteIntegrationBoundaryReleaseExportSnapshot[]): RendererConcreteIntegrationBoundaryReleaseExportSnapshotCatalog;
export declare function closeRendererConcreteIntegrationBoundaryRelease(name: string, catalog: RendererConcreteIntegrationBoundaryReleaseExportSnapshotCatalog): RendererConcreteIntegrationBoundaryReleaseClosure;
export declare function snapshotRendererConcreteIntegrationBoundaryReleaseClosure(closure: RendererConcreteIntegrationBoundaryReleaseClosure): RendererConcreteIntegrationBoundaryReleaseClosureSnapshot;
export declare function createRendererConcreteIntegrationBoundaryReleaseClosureSnapshotCatalog(name: string, snapshots: readonly RendererConcreteIntegrationBoundaryReleaseClosureSnapshot[]): RendererConcreteIntegrationBoundaryReleaseClosureSnapshotCatalog;
export declare function createRendererConcreteIntegrationBoundaryReleaseClosureExport(name: string, catalog: RendererConcreteIntegrationBoundaryReleaseClosureSnapshotCatalog): RendererConcreteIntegrationBoundaryReleaseClosureExport;
export declare function snapshotRendererConcreteIntegrationBoundaryReleaseClosureExport(releaseExport: RendererConcreteIntegrationBoundaryReleaseClosureExport): RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshot;
export declare function createRendererConcreteIntegrationBoundaryReleaseClosureExportSnapshotCatalog(name: string, snapshots: readonly RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshot[]): RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshotCatalog;
export declare function createRendererConcreteIntegrationBoundaryReleaseClosureDelivery(name: string, catalog: RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshotCatalog): RendererConcreteIntegrationBoundaryReleaseClosureDelivery;
export declare function inspectRendererMountReportConsumerResult(result: RendererMountReportConsumerResult): RendererMountReportConsumerDiagnosticReport;
export declare function aggregateRendererMountReportConsumerDiagnostics(reports: readonly RendererMountReportConsumerDiagnosticReport[]): RendererMountReportConsumerDiagnosticAggregation;
export declare function summarizeRendererMountReportConsumerDiagnosticAggregation(aggregation: RendererMountReportConsumerDiagnosticAggregation): RendererMountReportConsumerDiagnosticAggregationSummary;
export declare function evaluateRendererMountReportConsumerDiagnosticPolicy(summary: RendererMountReportConsumerDiagnosticAggregationSummary, policy?: RendererMountReportConsumerDiagnosticPolicy): RendererMountReportConsumerDiagnosticPolicyEvaluation;
