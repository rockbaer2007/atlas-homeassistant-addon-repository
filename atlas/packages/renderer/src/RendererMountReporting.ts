import type { RendererMountDiagnosticReport } from "./RendererMountDiagnostics";
import type {
  RendererMountLifecycleRecord,
  RendererMountLifecycleState,
} from "./RendererMountLifecycle";
import { inspectRendererMountPlan } from "./RendererMountPlan";
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

export function createRendererMountReport(
  record: RendererMountLifecycleRecord,
): RendererMountReport {
  const plan = inspectRendererMountPlan(record.plan);
  const issues = record.report ? [...record.report.result.issues] : [];

  return {
    state: record.state,
    planName: plan.name,
    strategy: plan.strategy,
    outputName: plan.outputName,
    targetName: plan.targetName,
    qualityGates: [...plan.qualityGates],
    planned: record.state === "planned",
    executed: record.state === "executed",
    reported: record.state === "reported",
    issueCount: issues.length,
    issues,
    ...(record.result ? { mounted: record.result.mounted } : {}),
    ...(record.report ? { diagnosticsOk: record.report.result.ok } : {}),
  };
}

export function summarizeRendererMountReports(
  records: readonly RendererMountLifecycleRecord[],
): RendererMountReportSummary {
  return summarizeRendererMountReportList(records.map(createRendererMountReport));
}

export function createRendererMountReportConsumption(
  request: RendererMountReportConsumptionRequest,
): RendererMountReportConsumption {
  const reports = request.records
    .map(createRendererMountReport)
    .filter(report => matchesRendererMountReportFilter(report, request.filter));

  return {
    reports,
    summary: summarizeRendererMountReportList(reports),
  };
}

function summarizeRendererMountReportList(
  reports: readonly RendererMountReport[],
): RendererMountReportSummary {
  return {
    total: reports.length,
    planned: reports.filter(report => report.state === "planned").length,
    executed: reports.filter(report => report.state === "executed").length,
    reported: reports.filter(report => report.state === "reported").length,
    mounted: reports.filter(report => report.mounted === true).length,
    diagnosticsOk: reports.filter(report => report.diagnosticsOk === true).length,
    failed: reports.filter(report => report.diagnosticsOk === false).length,
    issueCount: reports.reduce((total, report) => total + report.issueCount, 0),
  };
}

function matchesRendererMountReportFilter(
  report: RendererMountReport,
  filter: RendererMountReportFilter = {},
): boolean {
  return (
    (!filter.states || filter.states.includes(report.state)) &&
    (filter.mounted === undefined || report.mounted === filter.mounted) &&
    (
      filter.diagnosticsOk === undefined ||
      report.diagnosticsOk === filter.diagnosticsOk
    )
  );
}
