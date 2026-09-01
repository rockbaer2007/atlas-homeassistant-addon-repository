import type { RendererMountReportConsumption } from "./RendererMountReporting";

export const RendererMountReportConsumerDiagnosticCodes = {
  NotConsumed: "renderer.mount.report.consumer.not_consumed",
  ConsumerFailed: "renderer.mount.report.consumer.failed",
} as const;

export const RendererMountReportConsumerDiagnosticPolicyCodes = {
  ConsumerDiagnosticsFailed: "renderer.mount.report.consumer.diagnostics.policy.consumer_failed",
  IssueLimitExceeded: "renderer.mount.report.consumer.diagnostics.policy.issue_limit_exceeded",
} as const;

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

export type RendererMountReportConsumerOutput =
  | RendererMountReportConsumerResult
  | Promise<RendererMountReportConsumerResult>;

export type RendererMountReportConsumer = Readonly<{
  name: string;
  consume(
    consumption: RendererMountReportConsumption,
  ): RendererMountReportConsumerOutput;
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

export function createRendererMountReportConsumer(
  consumer: RendererMountReportConsumer,
): RendererMountReportConsumer {
  return {
    ...consumer,
  };
}

export function createRendererMountReportConsumerRegistry(
  consumers: readonly RendererMountReportConsumer[],
): RendererMountReportConsumerRegistry {
  return {
    consumers: [...consumers],
  };
}

export function createRendererMountReportConsumerLookupRequest(
  request: RendererMountReportConsumerLookupRequest,
): RendererMountReportConsumerLookupRequest {
  return {
    ...request,
  };
}

export function createRendererMountReportConsumerLookupResult(
  result: RendererMountReportConsumerLookupResult,
): RendererMountReportConsumerLookupResult {
  return {
    ...result,
  };
}

export function createRendererMountReportConsumerSelectionRequest(
  request: RendererMountReportConsumerSelectionRequest,
): RendererMountReportConsumerSelectionRequest {
  return {
    ...request,
    candidates: [...request.candidates],
  };
}

export function createRendererMountReportConsumerSelectionResult(
  result: RendererMountReportConsumerSelectionResult,
): RendererMountReportConsumerSelectionResult {
  return {
    ...result,
  };
}

export function createRendererMountReportConsumerConflict(
  conflict: RendererMountReportConsumerConflict,
): RendererMountReportConsumerConflict {
  return {
    ...conflict,
    consumers: [...conflict.consumers],
  };
}

export function createRendererMountReportConsumerConflictResolution(
  resolution: RendererMountReportConsumerConflictResolution,
): RendererMountReportConsumerConflictResolution {
  return {
    ...resolution,
    conflict: createRendererMountReportConsumerConflict(resolution.conflict),
  };
}

export function findRendererMountReportConsumer(
  registry: RendererMountReportConsumerRegistry,
  request: RendererMountReportConsumerLookupRequest,
): RendererMountReportConsumerLookupResult {
  const consumer = registry.consumers.find(candidate => candidate.name === request.name);

  return createRendererMountReportConsumerLookupResult({
    name: request.name,
    ...(consumer ? { consumer } : {}),
  });
}

export function findRendererMountReportConsumerConflicts(
  registry: RendererMountReportConsumerRegistry,
): readonly RendererMountReportConsumerConflict[] {
  const consumersByName = new Map<string, RendererMountReportConsumer[]>();

  for (const consumer of registry.consumers) {
    const consumers = consumersByName.get(consumer.name) ?? [];
    consumers.push(consumer);
    consumersByName.set(consumer.name, consumers);
  }

  return [...consumersByName.entries()]
    .filter(([, consumers]) => consumers.length > 1)
    .map(([name, consumers]) => createRendererMountReportConsumerConflict({
      name,
      consumers,
    }));
}

export function selectFirstRendererMountReportConsumerCandidate(
  request: RendererMountReportConsumerSelectionRequest,
): RendererMountReportConsumerSelectionResult {
  const consumer = request.candidates[0];

  return createRendererMountReportConsumerSelectionResult({
    name: request.name,
    ...(consumer ? { consumer } : {}),
  });
}

export function resolveRendererMountReportConsumerConflictWithFirstCandidate(
  conflict: RendererMountReportConsumerConflict,
): RendererMountReportConsumerConflictResolution {
  const selection = selectFirstRendererMountReportConsumerCandidate(
    createRendererMountReportConsumerSelectionRequest({
      name: conflict.name,
      candidates: conflict.consumers,
    }),
  );

  return createRendererMountReportConsumerConflictResolution({
    conflict,
    resolved: Boolean(selection.consumer),
    ...(selection.consumer ? { consumer: selection.consumer } : {}),
  });
}

export function resolveRendererMountReportConsumerRegistryConflictsWithFirstCandidate(
  registry: RendererMountReportConsumerRegistry,
): readonly RendererMountReportConsumerConflictResolution[] {
  return findRendererMountReportConsumerConflicts(registry)
    .map(resolveRendererMountReportConsumerConflictWithFirstCandidate);
}

export async function consumeRendererMountReports(
  consumer: RendererMountReportConsumer,
  consumption: RendererMountReportConsumption,
): Promise<RendererMountReportConsumerResult> {
  return consumer.consume(consumption);
}

export async function consumeAndInspectRendererMountReports(
  consumer: RendererMountReportConsumer,
  consumption: RendererMountReportConsumption,
): Promise<RendererMountReportConsumerDiagnosticExecution> {
  let result: RendererMountReportConsumerResult;

  try {
    result = await consumeRendererMountReports(consumer, consumption);
  } catch (error) {
    result = {
      consumerName: consumer.name,
      consumed: false,
      summary: consumption.summary,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return {
    consumerName: result.consumerName,
    result,
    diagnostic: inspectRendererMountReportConsumerResult(result),
  };
}

export async function consumeAndInspectRendererMountReportConsumers(
  consumers: readonly RendererMountReportConsumer[],
  consumption: RendererMountReportConsumption,
  policy?: RendererMountReportConsumerDiagnosticPolicy,
): Promise<RendererMountReportConsumerDiagnosticBatchExecution> {
  const executions: RendererMountReportConsumerDiagnosticExecution[] = [];

  for (const consumer of consumers) {
    executions.push(await consumeAndInspectRendererMountReports(consumer, consumption));
  }

  const aggregation = aggregateRendererMountReportConsumerDiagnostics(
    executions.map(execution => execution.diagnostic),
  );
  const summary = summarizeRendererMountReportConsumerDiagnosticAggregation(aggregation);

  return {
    executions,
    aggregation,
    summary,
    ...(policy ? {
      policyEvaluation: evaluateRendererMountReportConsumerDiagnosticPolicy(summary, policy),
    } : {}),
  };
}

export async function consumeAndInspectRendererMountReportConsumerRegistry(
  registry: RendererMountReportConsumerRegistry,
  consumption: RendererMountReportConsumption,
  policy?: RendererMountReportConsumerDiagnosticPolicy,
): Promise<RendererMountReportConsumerDiagnosticRegistryExecution> {
  return {
    registry,
    batch: await consumeAndInspectRendererMountReportConsumers(
      registry.consumers,
      consumption,
      policy,
    ),
  };
}

export function reviewRendererMountReportConsumerDiagnosticRegistryExecution(
  execution: RendererMountReportConsumerDiagnosticRegistryExecution,
): RendererMountReportConsumerDiagnosticRegistryExecutionClosure {
  const conflicts = findRendererMountReportConsumerConflicts(execution.registry);
  const policyOk = execution.batch.policyEvaluation?.result.ok;
  const issues = [
    ...execution.batch.aggregation.result.issues,
    ...conflicts.map(conflict => ({
      code: "renderer.mount.report.consumer.registry.execution.conflict",
      message: `${conflict.name} has ${conflict.consumers.length} Renderer mount report consumers`,
      severity: "error" as const,
    })),
    ...(execution.batch.policyEvaluation?.result.issues ?? []),
  ];

  return {
    context: {
      component: "renderer.mount.report.consumer.registry.execution.closure",
    },
    result: {
      ok: issues.length === 0,
      registryConsumerCount: execution.registry.consumers.length,
      executedConsumerCount: execution.batch.executions.length,
      conflictCount: conflicts.length,
      diagnosticsOk: execution.batch.aggregation.result.ok,
      ...(policyOk === undefined ? {} : { policyOk }),
      issues,
    },
  };
}

export function createRendererMountReportConsumerDiagnosticDelivery(
  name: string,
  closure: RendererMountReportConsumerDiagnosticRegistryExecutionClosure,
): RendererMountReportConsumerDiagnosticDelivery {
  return {
    kind: "renderer.mount.report.consumer.diagnostics.delivery",
    name,
    ready: closure.result.ok,
    issueCount: closure.result.issues.length,
    closure,
  };
}

export function createRendererMountReportConsumerDiagnosticDeliveryManifest(
  name: string,
  deliveries: readonly RendererMountReportConsumerDiagnosticDelivery[],
): RendererMountReportConsumerDiagnosticDeliveryManifest {
  const copiedDeliveries = [...deliveries];

  return {
    kind: "renderer.mount.report.consumer.diagnostics.delivery.manifest",
    name,
    deliveries: copiedDeliveries,
    readyCount: copiedDeliveries.filter(delivery => delivery.ready).length,
    blockedCount: copiedDeliveries.filter(delivery => !delivery.ready).length,
    issueCount: copiedDeliveries
      .reduce((issueCount, delivery) => issueCount + delivery.issueCount, 0),
  };
}

export function reviewRendererMountReportConsumerDiagnosticDeliveryManifest(
  manifest: RendererMountReportConsumerDiagnosticDeliveryManifest,
): RendererMountReportConsumerDiagnosticDeliveryManifestClosure {
  const issues = manifest.deliveries
    .flatMap(delivery => delivery.closure.result.issues);

  return {
    context: {
      component: "renderer.mount.report.consumer.diagnostics.delivery.manifest.closure",
      manifestName: manifest.name,
    },
    result: {
      ok: manifest.blockedCount === 0 && issues.length === 0,
      deliveryCount: manifest.deliveries.length,
      readyCount: manifest.readyCount,
      blockedCount: manifest.blockedCount,
      issueCount: issues.length,
      issues,
    },
  };
}

export function createRendererMountReportConsumerDiagnosticDeliveryBundle(
  name: string,
  closures: readonly RendererMountReportConsumerDiagnosticDeliveryManifestClosure[],
): RendererMountReportConsumerDiagnosticDeliveryBundle {
  const copiedClosures = [...closures];

  return {
    kind: "renderer.mount.report.consumer.diagnostics.delivery.bundle",
    name,
    ready: copiedClosures.every(closure => closure.result.ok),
    manifestCount: copiedClosures.length,
    issueCount: copiedClosures
      .reduce((issueCount, closure) => issueCount + closure.result.issueCount, 0),
    closures: copiedClosures,
  };
}

export function snapshotRendererMountReportConsumerDiagnosticDeliveryBundle(
  bundle: RendererMountReportConsumerDiagnosticDeliveryBundle,
): RendererMountReportConsumerDiagnosticDeliveryBundleSnapshot {
  return {
    kind: "renderer.mount.report.consumer.diagnostics.delivery.bundle.snapshot",
    bundleName: bundle.name,
    ready: bundle.ready,
    manifestCount: bundle.manifestCount,
    issueCount: bundle.issueCount,
    manifestNames: bundle.closures.map(closure => closure.context.manifestName),
  };
}

export function createRendererMountReportConsumerDiagnosticDeliverySnapshotCatalog(
  name: string,
  snapshots: readonly RendererMountReportConsumerDiagnosticDeliveryBundleSnapshot[],
): RendererMountReportConsumerDiagnosticDeliverySnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.mount.report.consumer.diagnostics.delivery.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
  };
}

export function createRendererMountReportConsumerDiagnosticDeliveryExport(
  name: string,
  catalog: RendererMountReportConsumerDiagnosticDeliverySnapshotCatalog,
): RendererMountReportConsumerDiagnosticDeliveryExport {
  return {
    kind: "renderer.mount.report.consumer.diagnostics.delivery.export",
    name,
    ready: catalog.blockedCount === 0,
    snapshotCount: catalog.snapshots.length,
    issueCount: catalog.issueCount,
    catalog,
  };
}

export function createRendererIntegrationPreparation(
  name: string,
  deliveryExport: RendererMountReportConsumerDiagnosticDeliveryExport,
): RendererIntegrationPreparation {
  return {
    kind: "renderer.integration.preparation",
    name,
    ready: deliveryExport.ready,
    issueCount: deliveryExport.issueCount,
    deliveryExport,
    boundaries: {
      transport: false,
      dom: false,
      homeAssistant: false,
      theme: false,
      platform: false,
    },
  };
}

export function reviewRendererIntegrationPreparationReadiness(
  preparation: RendererIntegrationPreparation,
): RendererIntegrationReadiness {
  const blockedBoundaries = Object.entries(preparation.boundaries)
    .filter(([, enabled]) => !enabled)
    .map(([boundary]) => boundary);
  const issues = [
    ...(!preparation.ready ? [{
      code: "renderer.integration.preparation.not_ready" as const,
      message: `${preparation.name} is not ready for Renderer integration`,
      severity: "error" as const,
    }] : []),
  ];

  return {
    context: {
      component: "renderer.integration",
      preparationName: preparation.name,
    },
    result: {
      ready: issues.length === 0,
      issueCount: preparation.issueCount,
      blockedBoundaries,
      issues,
    },
  };
}

export function createRendererIntegrationHandoff(
  name: string,
  readiness: RendererIntegrationReadiness,
): RendererIntegrationHandoff {
  return {
    kind: "renderer.integration.handoff",
    name,
    ready: readiness.result.ready,
    issueCount: readiness.result.issueCount,
    readiness,
  };
}

export function snapshotRendererIntegrationHandoff(
  handoff: RendererIntegrationHandoff,
): RendererIntegrationHandoffSnapshot {
  return {
    kind: "renderer.integration.handoff.snapshot",
    handoffName: handoff.name,
    ready: handoff.ready,
    issueCount: handoff.issueCount,
    preparationName: handoff.readiness.context.preparationName,
  };
}

export function createRendererIntegrationHandoffSnapshotCatalog(
  name: string,
  snapshots: readonly RendererIntegrationHandoffSnapshot[],
): RendererIntegrationHandoffSnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.integration.handoff.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
  };
}

export function reviewRendererConcreteIntegrationBoundary(
  name: string,
  catalog: RendererIntegrationHandoffSnapshotCatalog,
): RendererConcreteIntegrationBoundaryReview {
  return {
    kind: "renderer.concrete.integration.boundary.review",
    name,
    ready: catalog.blockedCount === 0,
    issueCount: catalog.issueCount,
    catalog,
    boundaries: {
      transport: false,
      dom: false,
      homeAssistant: false,
      theme: false,
      platform: false,
    },
  };
}

export function createRendererConcreteIntegrationBoundaryDecision(
  name: string,
  review: RendererConcreteIntegrationBoundaryReview,
): RendererConcreteIntegrationBoundaryDecision {
  const candidates = Object.keys(review.boundaries);

  return {
    kind: "renderer.concrete.integration.boundary.decision",
    name,
    ready: review.ready,
    issueCount: review.issueCount,
    review,
    candidates,
    ...(review.ready ? { selectedBoundary: candidates[0] } : {}),
  };
}

export function createRendererConcreteIntegrationBoundaryPlan(
  name: string,
  decision: RendererConcreteIntegrationBoundaryDecision,
): RendererConcreteIntegrationBoundaryPlan {
  return {
    kind: "renderer.concrete.integration.boundary.plan",
    name,
    ready: decision.ready,
    issueCount: decision.issueCount,
    decision,
    steps: ["review", "decide", "prepare"],
    ...(decision.selectedBoundary ? { plannedBoundary: decision.selectedBoundary } : {}),
  };
}

export function snapshotRendererConcreteIntegrationBoundaryPlan(
  plan: RendererConcreteIntegrationBoundaryPlan,
): RendererConcreteIntegrationBoundaryPlanSnapshot {
  return {
    kind: "renderer.concrete.integration.boundary.plan.snapshot",
    planName: plan.name,
    ready: plan.ready,
    issueCount: plan.issueCount,
    stepCount: plan.steps.length,
    ...(plan.plannedBoundary ? { plannedBoundary: plan.plannedBoundary } : {}),
  };
}

export function createRendererConcreteIntegrationBoundaryPlanSnapshotCatalog(
  name: string,
  snapshots: readonly RendererConcreteIntegrationBoundaryPlanSnapshot[],
): RendererConcreteIntegrationBoundaryPlanSnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.concrete.integration.boundary.plan.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
  };
}

export function prepareRendererConcreteIntegrationBoundaryExecution(
  name: string,
  catalog: RendererConcreteIntegrationBoundaryPlanSnapshotCatalog,
): RendererConcreteIntegrationBoundaryExecutionPreparation {
  return {
    kind: "renderer.concrete.integration.boundary.execution.preparation",
    name,
    ready: catalog.blockedCount === 0,
    issueCount: catalog.issueCount,
    catalog,
    execution: {
      prepared: catalog.blockedCount === 0,
      executable: false,
      planCount: catalog.snapshots.length,
    },
  };
}

export function closeRendererConcreteIntegrationBoundaryExecution(
  name: string,
  preparation: RendererConcreteIntegrationBoundaryExecutionPreparation,
): RendererConcreteIntegrationBoundaryExecutionClosure {
  return {
    kind: "renderer.concrete.integration.boundary.execution.closure",
    name,
    ready: preparation.ready,
    issueCount: preparation.issueCount,
    preparation,
    result: {
      closed: true,
      executable: false,
      planCount: preparation.execution.planCount,
    },
  };
}

export function snapshotRendererConcreteIntegrationBoundaryExecutionClosure(
  closure: RendererConcreteIntegrationBoundaryExecutionClosure,
): RendererConcreteIntegrationBoundaryExecutionClosureSnapshot {
  return {
    kind: "renderer.concrete.integration.boundary.execution.closure.snapshot",
    closureName: closure.name,
    ready: closure.ready,
    issueCount: closure.issueCount,
    planCount: closure.result.planCount,
    executable: false,
  };
}

export function createRendererConcreteIntegrationBoundaryExecutionClosureSnapshotCatalog(
  name: string,
  snapshots: readonly RendererConcreteIntegrationBoundaryExecutionClosureSnapshot[],
): RendererConcreteIntegrationBoundaryExecutionClosureSnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.concrete.integration.boundary.execution.closure.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    executableCount: 0,
  };
}

export function createRendererConcreteIntegrationBoundaryExecutionDelivery(
  name: string,
  catalog: RendererConcreteIntegrationBoundaryExecutionClosureSnapshotCatalog,
): RendererConcreteIntegrationBoundaryExecutionDelivery {
  return {
    kind: "renderer.concrete.integration.boundary.execution.delivery",
    name,
    ready: catalog.blockedCount === 0,
    issueCount: catalog.issueCount,
    catalog,
    executable: false,
  };
}

export function snapshotRendererConcreteIntegrationBoundaryExecutionDelivery(
  delivery: RendererConcreteIntegrationBoundaryExecutionDelivery,
): RendererConcreteIntegrationBoundaryExecutionDeliverySnapshot {
  return {
    kind: "renderer.concrete.integration.boundary.execution.delivery.snapshot",
    deliveryName: delivery.name,
    ready: delivery.ready,
    issueCount: delivery.issueCount,
    closureSnapshotCount: delivery.catalog.snapshots.length,
    executable: false,
  };
}

export function createRendererConcreteIntegrationBoundaryExecutionDeliverySnapshotCatalog(
  name: string,
  snapshots: readonly RendererConcreteIntegrationBoundaryExecutionDeliverySnapshot[],
): RendererConcreteIntegrationBoundaryExecutionDeliverySnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.concrete.integration.boundary.execution.delivery.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    executableCount: 0,
  };
}

export function createRendererConcreteIntegrationBoundaryExecutionExport(
  name: string,
  catalog: RendererConcreteIntegrationBoundaryExecutionDeliverySnapshotCatalog,
): RendererConcreteIntegrationBoundaryExecutionExport {
  return {
    kind: "renderer.concrete.integration.boundary.execution.export",
    name,
    ready: catalog.blockedCount === 0,
    issueCount: catalog.issueCount,
    catalog,
    executable: false,
  };
}

export function snapshotRendererConcreteIntegrationBoundaryExecutionExport(
  executionExport: RendererConcreteIntegrationBoundaryExecutionExport,
): RendererConcreteIntegrationBoundaryExecutionExportSnapshot {
  return {
    kind: "renderer.concrete.integration.boundary.execution.export.snapshot",
    exportName: executionExport.name,
    ready: executionExport.ready,
    issueCount: executionExport.issueCount,
    deliverySnapshotCount: executionExport.catalog.snapshots.length,
    executable: false,
  };
}

export function createRendererConcreteIntegrationBoundaryExecutionExportSnapshotCatalog(
  name: string,
  snapshots: readonly RendererConcreteIntegrationBoundaryExecutionExportSnapshot[],
): RendererConcreteIntegrationBoundaryExecutionExportSnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.concrete.integration.boundary.execution.export.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    executableCount: 0,
  };
}

export function finalizeRendererConcreteIntegrationBoundary(
  name: string,
  catalog: RendererConcreteIntegrationBoundaryExecutionExportSnapshotCatalog,
): RendererConcreteIntegrationBoundaryFinalization {
  return {
    kind: "renderer.concrete.integration.boundary.finalization",
    name,
    ready: catalog.blockedCount === 0,
    issueCount: catalog.issueCount,
    catalog,
    finalized: true,
    executable: false,
  };
}

export function snapshotRendererConcreteIntegrationBoundaryFinalization(
  finalization: RendererConcreteIntegrationBoundaryFinalization,
): RendererConcreteIntegrationBoundaryFinalizationSnapshot {
  return {
    kind: "renderer.concrete.integration.boundary.finalization.snapshot",
    finalizationName: finalization.name,
    ready: finalization.ready,
    issueCount: finalization.issueCount,
    exportSnapshotCount: finalization.catalog.snapshots.length,
    finalized: true,
    executable: false,
  };
}

export function createRendererConcreteIntegrationBoundaryFinalizationSnapshotCatalog(
  name: string,
  snapshots: readonly RendererConcreteIntegrationBoundaryFinalizationSnapshot[],
): RendererConcreteIntegrationBoundaryFinalizationSnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.concrete.integration.boundary.finalization.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    executableCount: 0,
  };
}

export function createRendererConcreteIntegrationBoundaryFinalizationHandoff(
  name: string,
  catalog: RendererConcreteIntegrationBoundaryFinalizationSnapshotCatalog,
): RendererConcreteIntegrationBoundaryFinalizationHandoff {
  return {
    kind: "renderer.concrete.integration.boundary.finalization.handoff",
    name,
    ready: catalog.blockedCount === 0,
    issueCount: catalog.issueCount,
    catalog,
    finalized: true,
    executable: false,
  };
}

export function snapshotRendererConcreteIntegrationBoundaryFinalizationHandoff(
  handoff: RendererConcreteIntegrationBoundaryFinalizationHandoff,
): RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshot {
  return {
    kind: "renderer.concrete.integration.boundary.finalization.handoff.snapshot",
    handoffName: handoff.name,
    ready: handoff.ready,
    issueCount: handoff.issueCount,
    finalizationSnapshotCount: handoff.catalog.snapshots.length,
    finalized: true,
    executable: false,
  };
}

export function createRendererConcreteIntegrationBoundaryFinalizationHandoffSnapshotCatalog(
  name: string,
  snapshots: readonly RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshot[],
): RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.concrete.integration.boundary.finalization.handoff.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    executableCount: 0,
  };
}

export function createRendererConcreteIntegrationBoundaryFinalizationExport(
  name: string,
  catalog: RendererConcreteIntegrationBoundaryFinalizationHandoffSnapshotCatalog,
): RendererConcreteIntegrationBoundaryFinalizationExport {
  return {
    kind: "renderer.concrete.integration.boundary.finalization.export",
    name,
    ready: catalog.blockedCount === 0,
    issueCount: catalog.issueCount,
    catalog,
    finalized: true,
    executable: false,
  };
}

export function snapshotRendererConcreteIntegrationBoundaryFinalizationExport(
  finalizationExport: RendererConcreteIntegrationBoundaryFinalizationExport,
): RendererConcreteIntegrationBoundaryFinalizationExportSnapshot {
  return {
    kind: "renderer.concrete.integration.boundary.finalization.export.snapshot",
    exportName: finalizationExport.name,
    ready: finalizationExport.ready,
    issueCount: finalizationExport.issueCount,
    handoffSnapshotCount: finalizationExport.catalog.snapshots.length,
    finalized: true,
    executable: false,
  };
}

export function createRendererConcreteIntegrationBoundaryFinalizationExportSnapshotCatalog(
  name: string,
  snapshots: readonly RendererConcreteIntegrationBoundaryFinalizationExportSnapshot[],
): RendererConcreteIntegrationBoundaryFinalizationExportSnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.concrete.integration.boundary.finalization.export.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    executableCount: 0,
  };
}

export function createRendererConcreteIntegrationBoundaryRelease(
  name: string,
  catalog: RendererConcreteIntegrationBoundaryFinalizationExportSnapshotCatalog,
): RendererConcreteIntegrationBoundaryRelease {
  return {
    kind: "renderer.concrete.integration.boundary.release",
    name,
    ready: catalog.blockedCount === 0,
    issueCount: catalog.issueCount,
    catalog,
    released: true,
    executable: false,
  };
}

export function snapshotRendererConcreteIntegrationBoundaryRelease(
  release: RendererConcreteIntegrationBoundaryRelease,
): RendererConcreteIntegrationBoundaryReleaseSnapshot {
  return {
    kind: "renderer.concrete.integration.boundary.release.snapshot",
    releaseName: release.name,
    ready: release.ready,
    issueCount: release.issueCount,
    snapshotCount: release.catalog.snapshots.length,
    released: true,
    executable: false,
  };
}

export function createRendererConcreteIntegrationBoundaryReleaseSnapshotCatalog(
  name: string,
  snapshots: readonly RendererConcreteIntegrationBoundaryReleaseSnapshot[],
): RendererConcreteIntegrationBoundaryReleaseSnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.concrete.integration.boundary.release.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    executableCount: 0,
  };
}

export function createRendererConcreteIntegrationBoundaryReleaseExport(
  name: string,
  catalog: RendererConcreteIntegrationBoundaryReleaseSnapshotCatalog,
): RendererConcreteIntegrationBoundaryReleaseExport {
  return {
    kind: "renderer.concrete.integration.boundary.release.export",
    name,
    ready: catalog.blockedCount === 0,
    issueCount: catalog.issueCount,
    catalog,
    exported: true,
    executable: false,
  };
}

export function snapshotRendererConcreteIntegrationBoundaryReleaseExport(
  releaseExport: RendererConcreteIntegrationBoundaryReleaseExport,
): RendererConcreteIntegrationBoundaryReleaseExportSnapshot {
  return {
    kind: "renderer.concrete.integration.boundary.release.export.snapshot",
    exportName: releaseExport.name,
    ready: releaseExport.ready,
    issueCount: releaseExport.issueCount,
    releaseSnapshotCount: releaseExport.catalog.snapshots.length,
    exported: true,
    executable: false,
  };
}

export function createRendererConcreteIntegrationBoundaryReleaseExportSnapshotCatalog(
  name: string,
  snapshots: readonly RendererConcreteIntegrationBoundaryReleaseExportSnapshot[],
): RendererConcreteIntegrationBoundaryReleaseExportSnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.concrete.integration.boundary.release.export.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    executableCount: 0,
  };
}

export function closeRendererConcreteIntegrationBoundaryRelease(
  name: string,
  catalog: RendererConcreteIntegrationBoundaryReleaseExportSnapshotCatalog,
): RendererConcreteIntegrationBoundaryReleaseClosure {
  return {
    kind: "renderer.concrete.integration.boundary.release.closure",
    name,
    ready: catalog.blockedCount === 0,
    issueCount: catalog.issueCount,
    catalog,
    closed: true,
    executable: false,
  };
}

export function snapshotRendererConcreteIntegrationBoundaryReleaseClosure(
  closure: RendererConcreteIntegrationBoundaryReleaseClosure,
): RendererConcreteIntegrationBoundaryReleaseClosureSnapshot {
  return {
    kind: "renderer.concrete.integration.boundary.release.closure.snapshot",
    closureName: closure.name,
    ready: closure.ready,
    issueCount: closure.issueCount,
    exportSnapshotCount: closure.catalog.snapshots.length,
    closed: true,
    executable: false,
  };
}

export function createRendererConcreteIntegrationBoundaryReleaseClosureSnapshotCatalog(
  name: string,
  snapshots: readonly RendererConcreteIntegrationBoundaryReleaseClosureSnapshot[],
): RendererConcreteIntegrationBoundaryReleaseClosureSnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.concrete.integration.boundary.release.closure.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    executableCount: 0,
  };
}

export function createRendererConcreteIntegrationBoundaryReleaseClosureExport(
  name: string,
  catalog: RendererConcreteIntegrationBoundaryReleaseClosureSnapshotCatalog,
): RendererConcreteIntegrationBoundaryReleaseClosureExport {
  return {
    kind: "renderer.concrete.integration.boundary.release.closure.export",
    name,
    ready: catalog.blockedCount === 0,
    issueCount: catalog.issueCount,
    catalog,
    exported: true,
    executable: false,
  };
}

export function snapshotRendererConcreteIntegrationBoundaryReleaseClosureExport(
  releaseExport: RendererConcreteIntegrationBoundaryReleaseClosureExport,
): RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshot {
  return {
    kind: "renderer.concrete.integration.boundary.release.closure.export.snapshot",
    exportName: releaseExport.name,
    ready: releaseExport.ready,
    issueCount: releaseExport.issueCount,
    closureSnapshotCount: releaseExport.catalog.snapshots.length,
    exported: true,
    executable: false,
  };
}

export function createRendererConcreteIntegrationBoundaryReleaseClosureExportSnapshotCatalog(
  name: string,
  snapshots: readonly RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshot[],
): RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshotCatalog {
  const copiedSnapshots = [...snapshots];

  return {
    kind: "renderer.concrete.integration.boundary.release.closure.export.snapshot.catalog",
    name,
    snapshots: copiedSnapshots,
    readyCount: copiedSnapshots.filter(snapshot => snapshot.ready).length,
    blockedCount: copiedSnapshots.filter(snapshot => !snapshot.ready).length,
    issueCount: copiedSnapshots
      .reduce((issueCount, snapshot) => issueCount + snapshot.issueCount, 0),
    executableCount: 0,
  };
}

export function createRendererConcreteIntegrationBoundaryReleaseClosureDelivery(
  name: string,
  catalog: RendererConcreteIntegrationBoundaryReleaseClosureExportSnapshotCatalog,
): RendererConcreteIntegrationBoundaryReleaseClosureDelivery {
  return {
    kind: "renderer.concrete.integration.boundary.release.closure.delivery",
    name,
    ready: catalog.blockedCount === 0,
    issueCount: catalog.issueCount,
    catalog,
    delivered: true,
    executable: false,
  };
}

export function inspectRendererMountReportConsumerResult(
  result: RendererMountReportConsumerResult,
): RendererMountReportConsumerDiagnosticReport {
  const issues = [
    ...(!result.consumed ? [{
      code: RendererMountReportConsumerDiagnosticCodes.NotConsumed,
      message: `${result.consumerName} did not consume Renderer mount reports`,
      severity: "error" as const,
    }] : []),
    ...(result.error ? [{
      code: RendererMountReportConsumerDiagnosticCodes.ConsumerFailed,
      message: result.error,
      severity: "error" as const,
    }] : []),
  ];

  return {
    context: {
      component: "renderer.mount.report.consumer",
      consumerName: result.consumerName,
    },
    result: {
      ok: issues.length === 0,
      issues,
    },
  };
}

export function aggregateRendererMountReportConsumerDiagnostics(
  reports: readonly RendererMountReportConsumerDiagnosticReport[],
): RendererMountReportConsumerDiagnosticAggregation {
  const copiedReports = reports.map(report => ({
    context: {
      ...report.context,
    },
    result: {
      ok: report.result.ok,
      issues: [...report.result.issues],
    },
  }));
  const issues = copiedReports.flatMap(report => report.result.issues);

  return {
    context: {
      component: "renderer.mount.report.consumer.diagnostics",
      consumerNames: copiedReports.map(report => report.context.consumerName),
    },
    result: {
      ok: issues.length === 0,
      reports: copiedReports,
      issues,
    },
  };
}

export function summarizeRendererMountReportConsumerDiagnosticAggregation(
  aggregation: RendererMountReportConsumerDiagnosticAggregation,
): RendererMountReportConsumerDiagnosticAggregationSummary {
  const okConsumerCount = aggregation.result.reports
    .filter(report => report.result.ok).length;
  const failedConsumerCount = aggregation.result.reports.length - okConsumerCount;

  return {
    ok: aggregation.result.ok,
    consumerCount: aggregation.result.reports.length,
    okConsumerCount,
    failedConsumerCount,
    issueCount: aggregation.result.issues.length,
  };
}

export function evaluateRendererMountReportConsumerDiagnosticPolicy(
  summary: RendererMountReportConsumerDiagnosticAggregationSummary,
  policy: RendererMountReportConsumerDiagnosticPolicy = {},
): RendererMountReportConsumerDiagnosticPolicyEvaluation {
  const requireAllConsumersOk = policy.requireAllConsumersOk ?? true;
  const issues = [
    ...(requireAllConsumersOk && summary.failedConsumerCount > 0 ? [{
      code: RendererMountReportConsumerDiagnosticPolicyCodes.ConsumerDiagnosticsFailed,
      message: `${summary.failedConsumerCount} Renderer mount report consumers failed diagnostics`,
      severity: "error" as const,
    }] : []),
    ...(policy.maxIssueCount !== undefined && summary.issueCount > policy.maxIssueCount ? [{
      code: RendererMountReportConsumerDiagnosticPolicyCodes.IssueLimitExceeded,
      message: `Renderer mount report consumer diagnostics reported ${summary.issueCount} issues, exceeding ${policy.maxIssueCount}`,
      severity: "error" as const,
    }] : []),
  ];

  return {
    context: {
      component: "renderer.mount.report.consumer.diagnostics.policy",
    },
    result: {
      ok: issues.length === 0,
      summary,
      issues,
    },
  };
}
