import { createRendererAdapterConflict, createRendererAdapterConflictResolution, } from "./RendererAdapterConflict";
import { createRendererMountPlan, } from "./RendererMountPlan";
import { executeRendererMountPlan } from "./RendererMountPlanExecution";
export function createRendererDomMountStore() {
    return {
        records: [],
    };
}
export function createRendererDomMountRecord(request) {
    return {
        outputName: request.output.name,
        outputKind: request.output.kind,
        targetName: request.target.name,
        elementId: request.target.identifier ?? "",
        html: request.output.content ?? "",
    };
}
export function findRendererDomMountRecords(store, request) {
    return store.records.filter(record => ((request.outputName === undefined || record.outputName === request.outputName) &&
        (request.targetName === undefined || record.targetName === request.targetName) &&
        (request.elementId === undefined || record.elementId === request.elementId)));
}
export function findLatestRendererDomMountRecord(store, request) {
    return findRendererDomMountRecords(store, request).at(-1);
}
export function clearRendererDomMountStore(store) {
    const records = store.records;
    records.splice(0, records.length);
    return store;
}
export function summarizeRendererDomMountStore(store) {
    return {
        recordCount: store.records.length,
        outputCount: new Set(store.records.map(record => record.outputName)).size,
        elementCount: new Set(store.records.map(record => record.elementId)).size,
        emptyHtmlCount: store.records.filter(record => record.html === "").length,
    };
}
export function inspectRendererDomMountResult(store, result) {
    const latestRecord = findLatestRendererDomMountRecord(store, {
        outputName: result.output.name,
        targetName: result.target.name,
        ...(result.target.identifier !== undefined
            ? { elementId: result.target.identifier }
            : {}),
    });
    return {
        mounted: result.mounted,
        outputName: result.output.name,
        targetName: result.target.name,
        recordCount: store.records.length,
        ...(latestRecord ? { latestRecord } : {}),
        ...(result.error ? { error: result.error } : {}),
    };
}
export function createRendererDomMountPlan(request) {
    return createRendererMountPlan({
        name: `dom:${request.output.name}->${request.target.name}`,
        status: "planned",
        strategy: "adapter",
        request,
        qualityGates: ["request", "output", "target", "diagnostics"],
    });
}
export async function executeRendererDomMountPlan(plan, adapter = createRendererDomMountAdapter("dom")) {
    return executeRendererMountPlan({
        plan,
        adapterResolution: createRendererAdapterConflictResolution({
            conflict: createRendererAdapterConflict({
                name: adapter.name,
                adapters: [adapter],
            }),
            resolved: true,
            adapter,
        }),
    });
}
export function createRendererDomMountAdapter(name, store = createRendererDomMountStore()) {
    const records = [...store.records];
    const mountedStore = {
        records,
    };
    return {
        name,
        store: mountedStore,
        clear() {
            clearRendererDomMountStore(mountedStore);
        },
        mount(request) {
            if (request.target.kind !== "surface") {
                return {
                    mounted: false,
                    output: request.output,
                    target: request.target,
                    error: `Renderer DOM adapter cannot mount to ${request.target.kind} targets`,
                };
            }
            if (!request.target.identifier) {
                return {
                    mounted: false,
                    output: request.output,
                    target: request.target,
                    error: "Renderer DOM adapter requires a target identifier.",
                };
            }
            records.push(createRendererDomMountRecord(request));
            return {
                mounted: true,
                output: request.output,
                target: request.target,
            };
        },
    };
}
