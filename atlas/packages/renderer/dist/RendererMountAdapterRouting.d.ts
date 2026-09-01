import type { RendererAdapter } from "./RendererAdapter";
import { type RendererAdapterRegistry } from "./RendererAdapterRegistry";
import { type RendererDomMountAdapter } from "./RendererDomMount";
import { type RendererDomSurface, type RendererDomSurfaceAdapter } from "./RendererDomSurface";
import { type RendererMemoryMountAdapter } from "./RendererMemoryMount";
import { type RendererMountResult } from "./RendererMount";
import { type RendererMountDiagnosticReport } from "./RendererMountDiagnostics";
import { type RendererMountLifecycleRecord } from "./RendererMountLifecycle";
import { type RendererMountReportConsumption, type RendererMountReportFilter, type RendererMountReport, type RendererMountReportSummary } from "./RendererMountReporting";
import type { RendererOutput } from "./RendererOutput";
import type { RendererTarget } from "./RendererTarget";
export declare const RendererDefaultMountAdapterNames: {
    readonly Memory: "renderer.memory";
    readonly Dom: "renderer.dom";
};
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
export declare function createDefaultRendererMountAdapterRegistry(memoryAdapter?: RendererMemoryMountAdapter, domAdapter?: RendererDomMountAdapter): RendererDefaultMountAdapterRegistry;
export declare function createRendererDomSurfaceMountAdapterRegistry(surfaces: readonly RendererDomSurface[], memoryAdapter?: RendererMemoryMountAdapter): RendererDomSurfaceMountAdapterRegistry;
export declare function resolveRendererTargetMountAdapter(registry: RendererAdapterRegistry, target: RendererTarget): RendererTargetMountAdapterResolution;
export declare function executeRendererTargetMount(request: RendererUnifiedMountRequest): Promise<RendererMountResult>;
export declare function executeRendererTargetMountWithReport(request: RendererUnifiedMountRequest): Promise<RendererUnifiedMountExecution>;
export declare function executeRendererTargetMountBatch(request: RendererUnifiedMountBatchRequest): Promise<RendererUnifiedMountBatchExecution>;
export declare function consumeRendererTargetMountBatchReports(request: RendererUnifiedMountBatchConsumptionRequest): RendererMountReportConsumption;
export declare function findRendererTargetMountBatchFailures(execution: RendererUnifiedMountBatchExecution): readonly RendererUnifiedMountExecution[];
export declare function closeRendererTargetMountBatchDiagnostics(execution: RendererUnifiedMountBatchExecution): RendererUnifiedMountBatchDiagnosticClosure;
export declare function snapshotRendererTargetMountBatchDiagnostics(closure: RendererUnifiedMountBatchDiagnosticClosure): RendererUnifiedMountBatchDiagnosticSnapshot;
export declare function handoffRendererTargetMountBatchDiagnostics(closure: RendererUnifiedMountBatchDiagnosticClosure): RendererUnifiedMountBatchDiagnosticHandoff;
export declare function createRendererTargetMountBatchDiagnosticCatalog(handoffs: readonly RendererUnifiedMountBatchDiagnosticHandoff[]): RendererUnifiedMountBatchDiagnosticCatalog;
export declare function snapshotRendererTargetMountBatchDiagnosticCatalog(catalog: RendererUnifiedMountBatchDiagnosticCatalog): RendererUnifiedMountBatchDiagnosticCatalogSnapshot;
export declare function exportRendererTargetMountBatchDiagnosticCatalog(catalog: RendererUnifiedMountBatchDiagnosticCatalog): RendererUnifiedMountBatchDiagnosticCatalogExport;
export declare function reviewRendererTargetMountIntegrationReadiness(exported: RendererUnifiedMountBatchDiagnosticCatalogExport): RendererTargetMountIntegrationReadiness;
export declare function snapshotRendererTargetMountIntegrationReadiness(readiness: RendererTargetMountIntegrationReadiness): RendererTargetMountIntegrationReadinessSnapshot;
export declare function handoffRendererTargetMountIntegrationReadiness(readiness: RendererTargetMountIntegrationReadiness): RendererTargetMountIntegrationReadinessHandoff;
export declare function createRendererTargetMountIntegrationReadinessCatalog(handoffs: readonly RendererTargetMountIntegrationReadinessHandoff[]): RendererTargetMountIntegrationReadinessCatalog;
export declare function snapshotRendererTargetMountIntegrationReadinessCatalog(catalog: RendererTargetMountIntegrationReadinessCatalog): RendererTargetMountIntegrationReadinessCatalogSnapshot;
export declare function exportRendererTargetMountIntegrationReadinessCatalog(catalog: RendererTargetMountIntegrationReadinessCatalog): RendererTargetMountIntegrationReadinessCatalogExport;
export declare function findRendererTargetMountIntegrationReadinessHandoffs(catalog: RendererTargetMountIntegrationReadinessCatalog, filter?: RendererTargetMountIntegrationReadinessHandoffFilter): readonly RendererTargetMountIntegrationReadinessHandoff[];
export declare function summarizeRendererTargetMountIntegrationStatus(exported: RendererTargetMountIntegrationReadinessCatalogExport): RendererTargetMountIntegrationStatus;
export declare function createRendererTargetMountIntegrationStatusHistory(entries?: readonly RendererTargetMountIntegrationStatus[]): RendererTargetMountIntegrationStatusHistory;
export declare function appendRendererTargetMountIntegrationStatusHistory(history: RendererTargetMountIntegrationStatusHistory, entry: RendererTargetMountIntegrationStatus): RendererTargetMountIntegrationStatusHistory;
export declare function snapshotRendererTargetMountIntegrationStatusHistory(history: RendererTargetMountIntegrationStatusHistory): RendererTargetMountIntegrationStatusHistorySnapshot;
export declare function exportRendererTargetMountIntegrationStatusHistory(history: RendererTargetMountIntegrationStatusHistory): RendererTargetMountIntegrationStatusHistoryExport;
export declare function findRendererTargetMountIntegrationStatusHistoryEntries(history: RendererTargetMountIntegrationStatusHistory, state: RendererTargetMountIntegrationStatus["state"]): readonly RendererTargetMountIntegrationStatus[];
