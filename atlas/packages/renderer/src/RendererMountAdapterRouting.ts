import type { RendererAdapter } from "./RendererAdapter";
import {
  createRendererAdapterRegistry,
  findRendererAdapter,
  type RendererAdapterRegistry,
} from "./RendererAdapterRegistry";
import {
  createRendererDomMountAdapter,
  type RendererDomMountAdapter,
} from "./RendererDomMount";
import {
  createRendererDomSurfaceAdapter,
  createRendererDomSurfaceRegistry,
  type RendererDomSurface,
  type RendererDomSurfaceAdapter,
} from "./RendererDomSurface";
import {
  createRendererMemoryMountAdapter,
  type RendererMemoryMountAdapter,
} from "./RendererMemoryMount";
import {
  createRendererMountRequest,
  createRendererMountResult,
  type RendererMountResult,
} from "./RendererMount";
import {
  inspectRendererMountResult,
  type RendererMountDiagnosticReport,
} from "./RendererMountDiagnostics";
import {
  createRendererMountLifecycleRecord,
  recordRendererMountLifecycleExecution,
  recordRendererMountLifecycleReport,
  type RendererMountLifecycleRecord,
} from "./RendererMountLifecycle";
import { createRendererMountPlan } from "./RendererMountPlan";
import {
  createRendererMountReportConsumption,
  createRendererMountReport,
  summarizeRendererMountReports,
  type RendererMountReportConsumption,
  type RendererMountReportFilter,
  type RendererMountReport,
  type RendererMountReportSummary,
} from "./RendererMountReporting";
import type { RendererOutput } from "./RendererOutput";
import type { RendererTarget, RendererTargetKind } from "./RendererTarget";

export const RendererDefaultMountAdapterNames = {
  Memory: "renderer.memory",
  Dom: "renderer.dom",
} as const;

export type RendererDefaultMountAdapterRegistry = Readonly<{
  registry: RendererAdapterRegistry;
  memoryAdapter: RendererMemoryMountAdapter;
  domAdapter: RendererDomMountAdapter;
}>;

export type RendererDomSurfaceMountAdapterRegistry = Readonly<{
  registry: RendererAdapterRegistry;
  memoryAdapter: RendererMemoryMountAdapter;
  domSurfaceAdapter: RendererDomSurfaceAdapter;
}>;

export type RendererTargetMountAdapterResolution = Readonly<{
  target: RendererTarget;
  adapterName: string;
  adapter?: RendererAdapter;
  error?: string;
}>;

export type RendererUnifiedMountRequest = Readonly<{
  output: RendererOutput;
  target: RendererTarget;
  registry?: RendererAdapterRegistry;
}>;

export type RendererUnifiedMountExecution = Readonly<{
  result: RendererMountResult;
  lifecycleRecord: RendererMountLifecycleRecord;
  diagnosticReport: RendererMountDiagnosticReport;
  report: RendererMountReport;
}>;

export type RendererUnifiedMountBatchRequest = Readonly<{
  requests: readonly RendererUnifiedMountRequest[];
  registry?: RendererAdapterRegistry;
}>;

export type RendererUnifiedMountBatchExecution = Readonly<{
  executions: readonly RendererUnifiedMountExecution[];
  lifecycleRecords: readonly RendererMountLifecycleRecord[];
  reports: readonly RendererMountReport[];
  summary: RendererMountReportSummary;
}>;

export type RendererUnifiedMountBatchConsumptionRequest = Readonly<{
  execution: RendererUnifiedMountBatchExecution;
  filter?: RendererMountReportFilter;
}>;

export type RendererUnifiedMountBatchDiagnosticClosure = Readonly<{
  execution: RendererUnifiedMountBatchExecution;
  summary: RendererMountReportSummary;
  failures: readonly RendererUnifiedMountExecution[];
  ready: boolean;
  blocked: boolean;
  totalCount: number;
  mountedCount: number;
  failureCount: number;
  issueCount: number;
}>;

export type RendererUnifiedMountBatchDiagnosticSnapshot = Readonly<{
  ready: boolean;
  blocked: boolean;
  totalCount: number;
  mountedCount: number;
  failureCount: number;
  issueCount: number;
  failedOutputNames: readonly string[];
  failedTargetNames: readonly string[];
}>;

export type RendererUnifiedMountBatchDiagnosticHandoff = Readonly<{
  closure: RendererUnifiedMountBatchDiagnosticClosure;
  snapshot: RendererUnifiedMountBatchDiagnosticSnapshot;
  ready: boolean;
  blocked: boolean;
  transferable: boolean;
}>;

export type RendererUnifiedMountBatchDiagnosticCatalogSummary = Readonly<{
  handoffCount: number;
  readyCount: number;
  blockedCount: number;
  transferableCount: number;
}>;

export type RendererUnifiedMountBatchDiagnosticCatalog = Readonly<{
  handoffs: readonly RendererUnifiedMountBatchDiagnosticHandoff[];
  summary: RendererUnifiedMountBatchDiagnosticCatalogSummary;
}>;

export type RendererUnifiedMountBatchDiagnosticCatalogSnapshot = Readonly<{
  handoffCount: number;
  readyCount: number;
  blockedCount: number;
  transferableCount: number;
  ready: boolean;
  blocked: boolean;
}>;

export type RendererUnifiedMountBatchDiagnosticCatalogExport = Readonly<{
  catalog: RendererUnifiedMountBatchDiagnosticCatalog;
  snapshot: RendererUnifiedMountBatchDiagnosticCatalogSnapshot;
  ready: boolean;
  exportable: boolean;
}>;

export type RendererTargetMountIntegrationReadinessIssue = Readonly<{
  code: string;
  message: string;
  severity: "error";
}>;

export type RendererTargetMountIntegrationReadiness = Readonly<{
  export: RendererUnifiedMountBatchDiagnosticCatalogExport;
  ready: boolean;
  blocked: boolean;
  exportable: boolean;
  handoffCount: number;
  readyCount: number;
  blockedCount: number;
  transferableCount: number;
  issues: readonly RendererTargetMountIntegrationReadinessIssue[];
}>;

export type RendererTargetMountIntegrationReadinessSnapshot = Readonly<{
  ready: boolean;
  blocked: boolean;
  exportable: boolean;
  handoffCount: number;
  readyCount: number;
  blockedCount: number;
  transferableCount: number;
  issueCount: number;
  issueCodes: readonly string[];
}>;

export type RendererTargetMountIntegrationReadinessHandoff = Readonly<{
  readiness: RendererTargetMountIntegrationReadiness;
  snapshot: RendererTargetMountIntegrationReadinessSnapshot;
  ready: boolean;
  blocked: boolean;
  transferable: boolean;
}>;

export type RendererTargetMountIntegrationReadinessCatalogSummary = Readonly<{
  handoffCount: number;
  readyCount: number;
  blockedCount: number;
  transferableCount: number;
  issueCount: number;
}>;

export type RendererTargetMountIntegrationReadinessCatalog = Readonly<{
  handoffs: readonly RendererTargetMountIntegrationReadinessHandoff[];
  summary: RendererTargetMountIntegrationReadinessCatalogSummary;
}>;

export type RendererTargetMountIntegrationReadinessCatalogSnapshot = Readonly<{
  handoffCount: number;
  readyCount: number;
  blockedCount: number;
  transferableCount: number;
  issueCount: number;
  ready: boolean;
  blocked: boolean;
}>;

export type RendererTargetMountIntegrationReadinessCatalogExport = Readonly<{
  catalog: RendererTargetMountIntegrationReadinessCatalog;
  snapshot: RendererTargetMountIntegrationReadinessCatalogSnapshot;
  ready: boolean;
  exportable: boolean;
}>;

export type RendererTargetMountIntegrationReadinessHandoffFilter = Readonly<{
  ready?: boolean;
  blocked?: boolean;
  transferable?: boolean;
  issueCode?: string;
}>;

export type RendererTargetMountIntegrationStatus = Readonly<{
  state: "empty" | "ready" | "blocked";
  handoffCount: number;
  readyCount: number;
  blockedCount: number;
  transferableCount: number;
  issueCount: number;
  ready: boolean;
  blocked: boolean;
  exportable: boolean;
}>;

export type RendererTargetMountIntegrationStatusHistory = Readonly<{
  entries: readonly RendererTargetMountIntegrationStatus[];
}>;

export type RendererTargetMountIntegrationStatusHistorySnapshot = Readonly<{
  entryCount: number;
  readyCount: number;
  blockedCount: number;
  emptyCount: number;
  latestState: RendererTargetMountIntegrationStatus["state"] | undefined;
}>;

export type RendererTargetMountIntegrationStatusHistoryExport = Readonly<{
  history: RendererTargetMountIntegrationStatusHistory;
  snapshot: RendererTargetMountIntegrationStatusHistorySnapshot;
  exportable: boolean;
}>;

function getRendererMountAdapterName(targetKind: RendererTargetKind): string {
  return targetKind === "memory"
    ? RendererDefaultMountAdapterNames.Memory
    : RendererDefaultMountAdapterNames.Dom;
}

export function createDefaultRendererMountAdapterRegistry(
  memoryAdapter: RendererMemoryMountAdapter = createRendererMemoryMountAdapter(
    RendererDefaultMountAdapterNames.Memory,
  ),
  domAdapter: RendererDomMountAdapter = createRendererDomMountAdapter(
    RendererDefaultMountAdapterNames.Dom,
  ),
): RendererDefaultMountAdapterRegistry {
  return {
    memoryAdapter,
    domAdapter,
    registry: createRendererAdapterRegistry([memoryAdapter, domAdapter]),
  };
}

export function createRendererDomSurfaceMountAdapterRegistry(
  surfaces: readonly RendererDomSurface[],
  memoryAdapter: RendererMemoryMountAdapter = createRendererMemoryMountAdapter(
    RendererDefaultMountAdapterNames.Memory,
  ),
): RendererDomSurfaceMountAdapterRegistry {
  const domSurfaceAdapter = createRendererDomSurfaceAdapter(
    RendererDefaultMountAdapterNames.Dom,
    createRendererDomSurfaceRegistry(surfaces),
  );

  return {
    memoryAdapter,
    domSurfaceAdapter,
    registry: createRendererAdapterRegistry([memoryAdapter, domSurfaceAdapter]),
  };
}

export function resolveRendererTargetMountAdapter(
  registry: RendererAdapterRegistry,
  target: RendererTarget,
): RendererTargetMountAdapterResolution {
  const adapterName = getRendererMountAdapterName(target.kind);
  const lookup = findRendererAdapter(registry, {
    name: adapterName,
  });

  if (!lookup.adapter) {
    return {
      target,
      adapterName,
      error: `Renderer mount adapter ${adapterName} was not found.`,
    };
  }

  return {
    target,
    adapterName,
    adapter: lookup.adapter,
  };
}

export async function executeRendererTargetMount(
  request: RendererUnifiedMountRequest,
): Promise<RendererMountResult> {
  if (request.target.kind === "surface" && !request.target.identifier) {
    return createRendererMountResult({
      mounted: false,
      output: request.output,
      target: request.target,
      error: "Renderer surface targets require identifiers before adapter routing.",
    });
  }

  const registry = request.registry ?? createDefaultRendererMountAdapterRegistry().registry;
  const resolution = resolveRendererTargetMountAdapter(registry, request.target);

  if (!resolution.adapter) {
    return createRendererMountResult({
      mounted: false,
      output: request.output,
      target: request.target,
      error: resolution.error,
    });
  }

  return resolution.adapter.mount(createRendererMountRequest({
    output: request.output,
    target: request.target,
  }));
}

export async function executeRendererTargetMountWithReport(
  request: RendererUnifiedMountRequest,
): Promise<RendererUnifiedMountExecution> {
  const mountRequest = createRendererMountRequest({
    output: request.output,
    target: request.target,
  });
  const plan = createRendererMountPlan({
    name: `target:${request.output.name}->${request.target.name}`,
    status: "planned",
    strategy: "adapter",
    request: mountRequest,
    qualityGates: ["request", "output", "target", "diagnostics"],
  });
  const plannedRecord = createRendererMountLifecycleRecord(plan);
  const result = await executeRendererTargetMount(request);
  const executedRecord = recordRendererMountLifecycleExecution(plannedRecord, result);
  const diagnosticReport = inspectRendererMountResult(result);
  const lifecycleRecord = recordRendererMountLifecycleReport(executedRecord, diagnosticReport);

  return {
    result,
    lifecycleRecord,
    diagnosticReport,
    report: createRendererMountReport(lifecycleRecord),
  };
}

export async function executeRendererTargetMountBatch(
  request: RendererUnifiedMountBatchRequest,
): Promise<RendererUnifiedMountBatchExecution> {
  const registry = request.registry ?? createDefaultRendererMountAdapterRegistry().registry;
  const executions: RendererUnifiedMountExecution[] = [];

  for (const mountRequest of request.requests) {
    executions.push(await executeRendererTargetMountWithReport({
      ...mountRequest,
      registry: mountRequest.registry ?? registry,
    }));
  }

  const lifecycleRecords = executions.map(execution => execution.lifecycleRecord);

  return {
    executions,
    lifecycleRecords,
    reports: executions.map(execution => execution.report),
    summary: summarizeRendererMountReports(lifecycleRecords),
  };
}

export function consumeRendererTargetMountBatchReports(
  request: RendererUnifiedMountBatchConsumptionRequest,
): RendererMountReportConsumption {
  return createRendererMountReportConsumption({
    records: request.execution.lifecycleRecords,
    ...(request.filter ? { filter: request.filter } : {}),
  });
}

export function findRendererTargetMountBatchFailures(
  execution: RendererUnifiedMountBatchExecution,
): readonly RendererUnifiedMountExecution[] {
  return execution.executions.filter(item => item.report.diagnosticsOk === false);
}

export function closeRendererTargetMountBatchDiagnostics(
  execution: RendererUnifiedMountBatchExecution,
): RendererUnifiedMountBatchDiagnosticClosure {
  const failures = findRendererTargetMountBatchFailures(execution);
  const ready = execution.summary.total > 0 && failures.length === 0;

  return {
    execution,
    summary: execution.summary,
    failures,
    ready,
    blocked: !ready,
    totalCount: execution.summary.total,
    mountedCount: execution.summary.mounted,
    failureCount: failures.length,
    issueCount: execution.summary.issueCount,
  };
}

export function snapshotRendererTargetMountBatchDiagnostics(
  closure: RendererUnifiedMountBatchDiagnosticClosure,
): RendererUnifiedMountBatchDiagnosticSnapshot {
  return {
    ready: closure.ready,
    blocked: closure.blocked,
    totalCount: closure.totalCount,
    mountedCount: closure.mountedCount,
    failureCount: closure.failureCount,
    issueCount: closure.issueCount,
    failedOutputNames: closure.failures.map(item => item.report.outputName),
    failedTargetNames: closure.failures.map(item => item.report.targetName),
  };
}

export function handoffRendererTargetMountBatchDiagnostics(
  closure: RendererUnifiedMountBatchDiagnosticClosure,
): RendererUnifiedMountBatchDiagnosticHandoff {
  const snapshot = snapshotRendererTargetMountBatchDiagnostics(closure);

  return {
    closure,
    snapshot,
    ready: closure.ready,
    blocked: closure.blocked,
    transferable: closure.ready,
  };
}

export function createRendererTargetMountBatchDiagnosticCatalog(
  handoffs: readonly RendererUnifiedMountBatchDiagnosticHandoff[],
): RendererUnifiedMountBatchDiagnosticCatalog {
  const catalogHandoffs = [...handoffs];

  return {
    handoffs: catalogHandoffs,
    summary: {
      handoffCount: catalogHandoffs.length,
      readyCount: catalogHandoffs.filter(handoff => handoff.ready).length,
      blockedCount: catalogHandoffs.filter(handoff => handoff.blocked).length,
      transferableCount: catalogHandoffs.filter(handoff => handoff.transferable).length,
    },
  };
}

export function snapshotRendererTargetMountBatchDiagnosticCatalog(
  catalog: RendererUnifiedMountBatchDiagnosticCatalog,
): RendererUnifiedMountBatchDiagnosticCatalogSnapshot {
  return {
    ...catalog.summary,
    ready: catalog.summary.handoffCount > 0 && catalog.summary.blockedCount === 0,
    blocked: catalog.summary.handoffCount === 0 || catalog.summary.blockedCount > 0,
  };
}

export function exportRendererTargetMountBatchDiagnosticCatalog(
  catalog: RendererUnifiedMountBatchDiagnosticCatalog,
): RendererUnifiedMountBatchDiagnosticCatalogExport {
  const snapshot = snapshotRendererTargetMountBatchDiagnosticCatalog(catalog);

  return {
    catalog,
    snapshot,
    ready: snapshot.ready,
    exportable: snapshot.ready,
  };
}

export function reviewRendererTargetMountIntegrationReadiness(
  exported: RendererUnifiedMountBatchDiagnosticCatalogExport,
): RendererTargetMountIntegrationReadiness {
  const issues: RendererTargetMountIntegrationReadinessIssue[] = [];

  if (exported.snapshot.handoffCount === 0) {
    issues.push({
      code: "renderer.target.mount.integration.empty",
      message: "Renderer target mount integration has no diagnostic handoffs.",
      severity: "error",
    });
  }

  if (exported.snapshot.blockedCount > 0) {
    issues.push({
      code: "renderer.target.mount.integration.blocked",
      message: "Renderer target mount integration has blocked diagnostic handoffs.",
      severity: "error",
    });
  }

  if (!exported.exportable) {
    issues.push({
      code: "renderer.target.mount.integration.not_exportable",
      message: "Renderer target mount integration export is not exportable.",
      severity: "error",
    });
  }

  const ready = exported.exportable && issues.length === 0;

  return {
    export: exported,
    ready,
    blocked: !ready,
    exportable: exported.exportable,
    handoffCount: exported.snapshot.handoffCount,
    readyCount: exported.snapshot.readyCount,
    blockedCount: exported.snapshot.blockedCount,
    transferableCount: exported.snapshot.transferableCount,
    issues,
  };
}

export function snapshotRendererTargetMountIntegrationReadiness(
  readiness: RendererTargetMountIntegrationReadiness,
): RendererTargetMountIntegrationReadinessSnapshot {
  return {
    ready: readiness.ready,
    blocked: readiness.blocked,
    exportable: readiness.exportable,
    handoffCount: readiness.handoffCount,
    readyCount: readiness.readyCount,
    blockedCount: readiness.blockedCount,
    transferableCount: readiness.transferableCount,
    issueCount: readiness.issues.length,
    issueCodes: readiness.issues.map(issue => issue.code),
  };
}

export function handoffRendererTargetMountIntegrationReadiness(
  readiness: RendererTargetMountIntegrationReadiness,
): RendererTargetMountIntegrationReadinessHandoff {
  const snapshot = snapshotRendererTargetMountIntegrationReadiness(readiness);

  return {
    readiness,
    snapshot,
    ready: readiness.ready,
    blocked: readiness.blocked,
    transferable: readiness.ready,
  };
}

export function createRendererTargetMountIntegrationReadinessCatalog(
  handoffs: readonly RendererTargetMountIntegrationReadinessHandoff[],
): RendererTargetMountIntegrationReadinessCatalog {
  const catalogHandoffs = [...handoffs];

  return {
    handoffs: catalogHandoffs,
    summary: {
      handoffCount: catalogHandoffs.length,
      readyCount: catalogHandoffs.filter(handoff => handoff.ready).length,
      blockedCount: catalogHandoffs.filter(handoff => handoff.blocked).length,
      transferableCount: catalogHandoffs.filter(handoff => handoff.transferable).length,
      issueCount: catalogHandoffs.reduce(
        (total, handoff) => total + handoff.snapshot.issueCount,
        0,
      ),
    },
  };
}

export function snapshotRendererTargetMountIntegrationReadinessCatalog(
  catalog: RendererTargetMountIntegrationReadinessCatalog,
): RendererTargetMountIntegrationReadinessCatalogSnapshot {
  const ready = catalog.summary.handoffCount > 0 && catalog.summary.blockedCount === 0;

  return {
    ...catalog.summary,
    ready,
    blocked: !ready,
  };
}

export function exportRendererTargetMountIntegrationReadinessCatalog(
  catalog: RendererTargetMountIntegrationReadinessCatalog,
): RendererTargetMountIntegrationReadinessCatalogExport {
  const snapshot = snapshotRendererTargetMountIntegrationReadinessCatalog(catalog);

  return {
    catalog,
    snapshot,
    ready: snapshot.ready,
    exportable: snapshot.ready,
  };
}

export function findRendererTargetMountIntegrationReadinessHandoffs(
  catalog: RendererTargetMountIntegrationReadinessCatalog,
  filter: RendererTargetMountIntegrationReadinessHandoffFilter = {},
): readonly RendererTargetMountIntegrationReadinessHandoff[] {
  return catalog.handoffs.filter(handoff =>
    (filter.ready === undefined || handoff.ready === filter.ready)
    && (filter.blocked === undefined || handoff.blocked === filter.blocked)
    && (filter.transferable === undefined || handoff.transferable === filter.transferable)
    && (filter.issueCode === undefined || handoff.snapshot.issueCodes.includes(filter.issueCode)),
  );
}

export function summarizeRendererTargetMountIntegrationStatus(
  exported: RendererTargetMountIntegrationReadinessCatalogExport,
): RendererTargetMountIntegrationStatus {
  return {
    state: exported.snapshot.handoffCount === 0
      ? "empty"
      : exported.snapshot.blocked
        ? "blocked"
        : "ready",
    handoffCount: exported.snapshot.handoffCount,
    readyCount: exported.snapshot.readyCount,
    blockedCount: exported.snapshot.blockedCount,
    transferableCount: exported.snapshot.transferableCount,
    issueCount: exported.snapshot.issueCount,
    ready: exported.ready,
    blocked: exported.snapshot.blocked,
    exportable: exported.exportable,
  };
}

export function createRendererTargetMountIntegrationStatusHistory(
  entries: readonly RendererTargetMountIntegrationStatus[] = [],
): RendererTargetMountIntegrationStatusHistory {
  return {
    entries: [...entries],
  };
}

export function appendRendererTargetMountIntegrationStatusHistory(
  history: RendererTargetMountIntegrationStatusHistory,
  entry: RendererTargetMountIntegrationStatus,
): RendererTargetMountIntegrationStatusHistory {
  return createRendererTargetMountIntegrationStatusHistory([...history.entries, entry]);
}

export function snapshotRendererTargetMountIntegrationStatusHistory(
  history: RendererTargetMountIntegrationStatusHistory,
): RendererTargetMountIntegrationStatusHistorySnapshot {
  return {
    entryCount: history.entries.length,
    readyCount: history.entries.filter(entry => entry.state === "ready").length,
    blockedCount: history.entries.filter(entry => entry.state === "blocked").length,
    emptyCount: history.entries.filter(entry => entry.state === "empty").length,
    latestState: history.entries[history.entries.length - 1]?.state,
  };
}

export function exportRendererTargetMountIntegrationStatusHistory(
  history: RendererTargetMountIntegrationStatusHistory,
): RendererTargetMountIntegrationStatusHistoryExport {
  const snapshot = snapshotRendererTargetMountIntegrationStatusHistory(history);

  return {
    history,
    snapshot,
    exportable: snapshot.entryCount > 0,
  };
}

export function findRendererTargetMountIntegrationStatusHistoryEntries(
  history: RendererTargetMountIntegrationStatusHistory,
  state: RendererTargetMountIntegrationStatus["state"],
): readonly RendererTargetMountIntegrationStatus[] {
  return history.entries.filter(entry => entry.state === state);
}
