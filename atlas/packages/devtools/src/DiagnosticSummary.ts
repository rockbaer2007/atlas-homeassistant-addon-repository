import {
  DiagnosticSeverities,
  type DiagnosticReport,
  type DiagnosticSeverity,
} from "@atlas/foundation";

export type DiagnosticSummaryStatus = "unavailable" | "healthy" | "issues";

export type DiagnosticSummary = Readonly<{
  status: DiagnosticSummaryStatus;
  reportCount: number;
  issueCount: number;
  bySeverity: Readonly<Record<DiagnosticSeverity, number>>;
}>;

/** Summarize read-only diagnostic reports for a compact developer-facing status view. */
export function summarizeDiagnostics(
  reports: readonly DiagnosticReport[],
): DiagnosticSummary {
  const bySeverity: Record<DiagnosticSeverity, number> = {
    [DiagnosticSeverities.Info]: 0,
    [DiagnosticSeverities.Warning]: 0,
    [DiagnosticSeverities.Error]: 0,
  };
  let issueCount = 0;

  for (const report of reports) {
    for (const issue of report.result.issues) {
      issueCount += 1;
      bySeverity[issue.severity] += 1;
    }
  }

  const status: DiagnosticSummaryStatus = reports.length === 0
    ? "unavailable"
    : reports.every(report => report.result.ok)
      ? "healthy"
      : "issues";

  return {
    status,
    reportCount: reports.length,
    issueCount,
    bySeverity,
  };
}
