import type { RendererMountDiagnosticReport } from "./RendererMountDiagnostics";
import type { RendererMountResult } from "./RendererMount";
import type { RendererMountPlan } from "./RendererMountPlan";
export type RendererMountLifecycleState = "planned" | "executed" | "reported";
export type RendererMountLifecycleRecord = Readonly<{
    plan: RendererMountPlan;
    state: RendererMountLifecycleState;
    result?: RendererMountResult;
    report?: RendererMountDiagnosticReport;
}>;
export type RendererMountLifecycleReport = Readonly<{
    state: RendererMountLifecycleState;
    planName: string;
    outputName: string;
    targetName: string;
    mounted?: boolean;
    diagnosticsOk?: boolean;
}>;
export declare function createRendererMountLifecycleRecord(plan: RendererMountPlan): RendererMountLifecycleRecord;
export declare function recordRendererMountLifecycleExecution(record: RendererMountLifecycleRecord, result: RendererMountResult): RendererMountLifecycleRecord;
export declare function recordRendererMountLifecycleReport(record: RendererMountLifecycleRecord, report?: RendererMountDiagnosticReport): RendererMountLifecycleRecord;
export declare function inspectRendererMountLifecycleRecord(record: RendererMountLifecycleRecord): RendererMountLifecycleReport;
