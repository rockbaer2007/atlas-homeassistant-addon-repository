import { inspectRendererMountPlan } from "./RendererMountPlan";
export function createRendererMountReport(record) {
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
export function summarizeRendererMountReports(records) {
    return summarizeRendererMountReportList(records.map(createRendererMountReport));
}
export function createRendererMountReportConsumption(request) {
    const reports = request.records
        .map(createRendererMountReport)
        .filter(report => matchesRendererMountReportFilter(report, request.filter));
    return {
        reports,
        summary: summarizeRendererMountReportList(reports),
    };
}
function summarizeRendererMountReportList(reports) {
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
function matchesRendererMountReportFilter(report, filter = {}) {
    return ((!filter.states || filter.states.includes(report.state)) &&
        (filter.mounted === undefined || report.mounted === filter.mounted) &&
        (filter.diagnosticsOk === undefined ||
            report.diagnosticsOk === filter.diagnosticsOk));
}
