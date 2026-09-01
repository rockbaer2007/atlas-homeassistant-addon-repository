import type { RendererMountDiagnosticReport } from "./RendererMountDiagnostics";
import type { RendererMountLifecycleRecord, RendererMountLifecycleState } from "./RendererMountLifecycle";
import type { RendererMountPlanQualityGate, RendererMountPlanStrategy } from "./RendererMountPlan";
export type RendererMountReportIssue = RendererMountDiagnosticReport["result"]["issues"][number];
export type RendererMountReport = Readonly<{
    state: RendererMountLifecycleState;
    planName: string;
    strategy: RendererMountPlanStrategy;
    outputName: string;
    targetName: string;
    qualityGates: readonly RendererMountPlanQualityGate[];
    planned: boolean;
    executed: boolean;
    reported: boolean;
    issueCount: number;
    issues: readonly RendererMountReportIssue[];
    mounted?: boolean;
    diagnosticsOk?: boolean;
}>;
export type RendererMountReportSummary = Readonly<{
    total: number;
    planned: number;
    executed: number;
    reported: number;
    mounted: number;
    diagnosticsOk: number;
    failed: number;
    issueCount: number;
}>;
export type RendererMountReportFilter = Readonly<{
    states?: readonly RendererMountLifecycleState[];
    mounted?: boolean;
    diagnosticsOk?: boolean;
}>;
export type RendererMountReportConsumption = Readonly<{
    reports: readonly RendererMountReport[];
    summary: RendererMountReportSummary;
}>;
export type RendererMountReportConsumptionRequest = Readonly<{
    records: readonly RendererMountLifecycleRecord[];
    filter?: RendererMountReportFilter;
}>;
export declare function createRendererMountReport(record: RendererMountLifecycleRecord): RendererMountReport;
export declare function summarizeRendererMountReports(records: readonly RendererMountLifecycleRecord[]): RendererMountReportSummary;
export declare function createRendererMountReportConsumption(request: RendererMountReportConsumptionRequest): RendererMountReportConsumption;
