import { inspectRendererMountResult } from "./RendererMountDiagnostics";
export function createRendererMountLifecycleRecord(plan) {
    return {
        plan,
        state: "planned",
    };
}
export function recordRendererMountLifecycleExecution(record, result) {
    return {
        plan: record.plan,
        state: "executed",
        result,
    };
}
export function recordRendererMountLifecycleReport(record, report = record.result
    ? inspectRendererMountResult(record.result)
    : {
        context: {
            component: "renderer.mount",
        },
        result: {
            ok: true,
            issues: [],
        },
    }) {
    return {
        plan: record.plan,
        state: "reported",
        ...(record.result ? { result: record.result } : {}),
        report,
    };
}
export function inspectRendererMountLifecycleRecord(record) {
    return {
        state: record.state,
        planName: record.plan.name,
        outputName: record.plan.request.output.name,
        targetName: record.plan.request.target.name,
        ...(record.result ? { mounted: record.result.mounted } : {}),
        ...(record.report ? { diagnosticsOk: record.report.result.ok } : {}),
    };
}
