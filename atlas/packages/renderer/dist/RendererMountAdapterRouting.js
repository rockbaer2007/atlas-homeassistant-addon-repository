import { createRendererAdapterRegistry, findRendererAdapter, } from "./RendererAdapterRegistry";
import { createRendererDomMountAdapter, } from "./RendererDomMount";
import { createRendererDomSurfaceAdapter, createRendererDomSurfaceRegistry, } from "./RendererDomSurface";
import { createRendererMemoryMountAdapter, } from "./RendererMemoryMount";
import { createRendererMountRequest, createRendererMountResult, } from "./RendererMount";
import { inspectRendererMountResult, } from "./RendererMountDiagnostics";
import { createRendererMountLifecycleRecord, recordRendererMountLifecycleExecution, recordRendererMountLifecycleReport, } from "./RendererMountLifecycle";
import { createRendererMountPlan } from "./RendererMountPlan";
import { createRendererMountReportConsumption, createRendererMountReport, summarizeRendererMountReports, } from "./RendererMountReporting";
export const RendererDefaultMountAdapterNames = {
    Memory: "renderer.memory",
    Dom: "renderer.dom",
};
function getRendererMountAdapterName(targetKind) {
    return targetKind === "memory"
        ? RendererDefaultMountAdapterNames.Memory
        : RendererDefaultMountAdapterNames.Dom;
}
export function createDefaultRendererMountAdapterRegistry(memoryAdapter = createRendererMemoryMountAdapter(RendererDefaultMountAdapterNames.Memory), domAdapter = createRendererDomMountAdapter(RendererDefaultMountAdapterNames.Dom)) {
    return {
        memoryAdapter,
        domAdapter,
        registry: createRendererAdapterRegistry([memoryAdapter, domAdapter]),
    };
}
export function createRendererDomSurfaceMountAdapterRegistry(surfaces, memoryAdapter = createRendererMemoryMountAdapter(RendererDefaultMountAdapterNames.Memory)) {
    const domSurfaceAdapter = createRendererDomSurfaceAdapter(RendererDefaultMountAdapterNames.Dom, createRendererDomSurfaceRegistry(surfaces));
    return {
        memoryAdapter,
        domSurfaceAdapter,
        registry: createRendererAdapterRegistry([memoryAdapter, domSurfaceAdapter]),
    };
}
export function resolveRendererTargetMountAdapter(registry, target) {
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
export async function executeRendererTargetMount(request) {
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
export async function executeRendererTargetMountWithReport(request) {
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
export async function executeRendererTargetMountBatch(request) {
    const registry = request.registry ?? createDefaultRendererMountAdapterRegistry().registry;
    const executions = [];
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
export function consumeRendererTargetMountBatchReports(request) {
    return createRendererMountReportConsumption({
        records: request.execution.lifecycleRecords,
        ...(request.filter ? { filter: request.filter } : {}),
    });
}
export function findRendererTargetMountBatchFailures(execution) {
    return execution.executions.filter(item => item.report.diagnosticsOk === false);
}
export function closeRendererTargetMountBatchDiagnostics(execution) {
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
export function snapshotRendererTargetMountBatchDiagnostics(closure) {
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
export function handoffRendererTargetMountBatchDiagnostics(closure) {
    const snapshot = snapshotRendererTargetMountBatchDiagnostics(closure);
    return {
        closure,
        snapshot,
        ready: closure.ready,
        blocked: closure.blocked,
        transferable: closure.ready,
    };
}
export function createRendererTargetMountBatchDiagnosticCatalog(handoffs) {
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
export function snapshotRendererTargetMountBatchDiagnosticCatalog(catalog) {
    return {
        ...catalog.summary,
        ready: catalog.summary.handoffCount > 0 && catalog.summary.blockedCount === 0,
        blocked: catalog.summary.handoffCount === 0 || catalog.summary.blockedCount > 0,
    };
}
export function exportRendererTargetMountBatchDiagnosticCatalog(catalog) {
    const snapshot = snapshotRendererTargetMountBatchDiagnosticCatalog(catalog);
    return {
        catalog,
        snapshot,
        ready: snapshot.ready,
        exportable: snapshot.ready,
    };
}
export function reviewRendererTargetMountIntegrationReadiness(exported) {
    const issues = [];
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
export function snapshotRendererTargetMountIntegrationReadiness(readiness) {
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
export function handoffRendererTargetMountIntegrationReadiness(readiness) {
    const snapshot = snapshotRendererTargetMountIntegrationReadiness(readiness);
    return {
        readiness,
        snapshot,
        ready: readiness.ready,
        blocked: readiness.blocked,
        transferable: readiness.ready,
    };
}
export function createRendererTargetMountIntegrationReadinessCatalog(handoffs) {
    const catalogHandoffs = [...handoffs];
    return {
        handoffs: catalogHandoffs,
        summary: {
            handoffCount: catalogHandoffs.length,
            readyCount: catalogHandoffs.filter(handoff => handoff.ready).length,
            blockedCount: catalogHandoffs.filter(handoff => handoff.blocked).length,
            transferableCount: catalogHandoffs.filter(handoff => handoff.transferable).length,
            issueCount: catalogHandoffs.reduce((total, handoff) => total + handoff.snapshot.issueCount, 0),
        },
    };
}
export function snapshotRendererTargetMountIntegrationReadinessCatalog(catalog) {
    const ready = catalog.summary.handoffCount > 0 && catalog.summary.blockedCount === 0;
    return {
        ...catalog.summary,
        ready,
        blocked: !ready,
    };
}
export function exportRendererTargetMountIntegrationReadinessCatalog(catalog) {
    const snapshot = snapshotRendererTargetMountIntegrationReadinessCatalog(catalog);
    return {
        catalog,
        snapshot,
        ready: snapshot.ready,
        exportable: snapshot.ready,
    };
}
export function findRendererTargetMountIntegrationReadinessHandoffs(catalog, filter = {}) {
    return catalog.handoffs.filter(handoff => (filter.ready === undefined || handoff.ready === filter.ready)
        && (filter.blocked === undefined || handoff.blocked === filter.blocked)
        && (filter.transferable === undefined || handoff.transferable === filter.transferable)
        && (filter.issueCode === undefined || handoff.snapshot.issueCodes.includes(filter.issueCode)));
}
export function summarizeRendererTargetMountIntegrationStatus(exported) {
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
export function createRendererTargetMountIntegrationStatusHistory(entries = []) {
    return {
        entries: [...entries],
    };
}
export function appendRendererTargetMountIntegrationStatusHistory(history, entry) {
    return createRendererTargetMountIntegrationStatusHistory([...history.entries, entry]);
}
export function snapshotRendererTargetMountIntegrationStatusHistory(history) {
    return {
        entryCount: history.entries.length,
        readyCount: history.entries.filter(entry => entry.state === "ready").length,
        blockedCount: history.entries.filter(entry => entry.state === "blocked").length,
        emptyCount: history.entries.filter(entry => entry.state === "empty").length,
        latestState: history.entries[history.entries.length - 1]?.state,
    };
}
export function exportRendererTargetMountIntegrationStatusHistory(history) {
    const snapshot = snapshotRendererTargetMountIntegrationStatusHistory(history);
    return {
        history,
        snapshot,
        exportable: snapshot.entryCount > 0,
    };
}
export function findRendererTargetMountIntegrationStatusHistoryEntries(history, state) {
    return history.entries.filter(entry => entry.state === state);
}
