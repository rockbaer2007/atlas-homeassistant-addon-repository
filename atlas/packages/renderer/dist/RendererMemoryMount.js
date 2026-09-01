import { createRendererAdapterConflict, createRendererAdapterConflictResolution, } from "./RendererAdapterConflict";
import { createRendererMountPlan, } from "./RendererMountPlan";
import { executeRendererMountPlan } from "./RendererMountPlanExecution";
export function createRendererMemoryMountStore() {
    return {
        records: [],
    };
}
export function createRendererMemoryMountRecord(request) {
    return {
        outputName: request.output.name,
        outputKind: request.output.kind,
        targetName: request.target.name,
        ...(request.target.identifier !== undefined
            ? { targetIdentifier: request.target.identifier }
            : {}),
        content: request.output.content ?? "",
    };
}
export function findRendererMemoryMountRecords(store, request) {
    return store.records.filter(record => ((request.outputName === undefined || record.outputName === request.outputName) &&
        (request.targetName === undefined || record.targetName === request.targetName) &&
        (request.targetIdentifier === undefined ||
            record.targetIdentifier === request.targetIdentifier)));
}
export function findLatestRendererMemoryMountRecord(store, request) {
    return findRendererMemoryMountRecords(store, request).at(-1);
}
export function clearRendererMemoryMountStore(store) {
    const records = store.records;
    records.splice(0, records.length);
    return store;
}
export function summarizeRendererMemoryMountStore(store) {
    return {
        recordCount: store.records.length,
        outputCount: new Set(store.records.map(record => record.outputName)).size,
        targetCount: new Set(store.records.map(record => record.targetName)).size,
        emptyContentCount: store.records.filter(record => record.content === "").length,
    };
}
export function inspectRendererMemoryMountResult(store, result) {
    const latestRecord = findLatestRendererMemoryMountRecord(store, {
        outputName: result.output.name,
        targetName: result.target.name,
        ...(result.target.identifier !== undefined
            ? { targetIdentifier: result.target.identifier }
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
export function createRendererMemoryMountPlan(request) {
    return createRendererMountPlan({
        name: `memory:${request.output.name}->${request.target.name}`,
        status: "planned",
        strategy: "adapter",
        request,
        qualityGates: ["request", "output", "target", "diagnostics"],
    });
}
export async function executeRendererMemoryMountPlan(plan, adapter = createRendererMemoryMountAdapter("memory")) {
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
export function createRendererMemoryMountAdapter(name, store = createRendererMemoryMountStore()) {
    const records = [...store.records];
    const mountedStore = {
        records,
    };
    return {
        name,
        store: mountedStore,
        clear() {
            clearRendererMemoryMountStore(mountedStore);
        },
        mount(request) {
            if (request.target.kind !== "memory") {
                return {
                    mounted: false,
                    output: request.output,
                    target: request.target,
                    error: `Renderer memory adapter cannot mount to ${request.target.kind} targets`,
                };
            }
            records.push(createRendererMemoryMountRecord(request));
            return {
                mounted: true,
                output: request.output,
                target: request.target,
            };
        },
    };
}
