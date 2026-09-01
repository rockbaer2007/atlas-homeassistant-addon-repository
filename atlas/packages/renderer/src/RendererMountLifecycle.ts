import type { RendererMountDiagnosticReport } from "./RendererMountDiagnostics";
import { inspectRendererMountResult } from "./RendererMountDiagnostics";
import type { RendererMountResult } from "./RendererMount";
import type { RendererMountPlan } from "./RendererMountPlan";

export type RendererMountLifecycleState =
  | "planned"
  | "executed"
  | "reported";

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

export function createRendererMountLifecycleRecord(
  plan: RendererMountPlan,
): RendererMountLifecycleRecord {
  return {
    plan,
    state: "planned",
  };
}

export function recordRendererMountLifecycleExecution(
  record: RendererMountLifecycleRecord,
  result: RendererMountResult,
): RendererMountLifecycleRecord {
  return {
    plan: record.plan,
    state: "executed",
    result,
  };
}

export function recordRendererMountLifecycleReport(
  record: RendererMountLifecycleRecord,
  report: RendererMountDiagnosticReport = record.result
    ? inspectRendererMountResult(record.result)
    : {
      context: {
        component: "renderer.mount",
      },
      result: {
        ok: true,
        issues: [],
      },
    },
): RendererMountLifecycleRecord {
  return {
    plan: record.plan,
    state: "reported",
    ...(record.result ? { result: record.result } : {}),
    report,
  };
}

export function inspectRendererMountLifecycleRecord(
  record: RendererMountLifecycleRecord,
): RendererMountLifecycleReport {
  return {
    state: record.state,
    planName: record.plan.name,
    outputName: record.plan.request.output.name,
    targetName: record.plan.request.target.name,
    ...(record.result ? { mounted: record.result.mounted } : {}),
    ...(record.report ? { diagnosticsOk: record.report.result.ok } : {}),
  };
}
