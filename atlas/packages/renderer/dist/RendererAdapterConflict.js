import { createRendererMountResult, } from "./RendererMount";
import { createRendererAdapterSelectionRequest, selectFirstRendererAdapterCandidate, } from "./RendererAdapterSelection";
export function createRendererAdapterConflict(conflict) {
    return {
        ...conflict,
        adapters: [...conflict.adapters],
    };
}
export function createRendererAdapterConflictResolution(resolution) {
    return {
        ...resolution,
        conflict: createRendererAdapterConflict(resolution.conflict),
    };
}
export function findRendererAdapterConflicts(registry) {
    const adaptersByName = new Map();
    for (const adapter of registry.adapters) {
        const adapters = adaptersByName.get(adapter.name) ?? [];
        adapters.push(adapter);
        adaptersByName.set(adapter.name, adapters);
    }
    return [...adaptersByName.entries()]
        .filter(([, adapters]) => adapters.length > 1)
        .map(([name, adapters]) => createRendererAdapterConflict({
        name,
        adapters,
    }));
}
export function resolveRendererAdapterConflictWithFirstCandidate(conflict) {
    const selection = selectFirstRendererAdapterCandidate(createRendererAdapterSelectionRequest({
        name: conflict.name,
        candidates: conflict.adapters,
    }));
    return createRendererAdapterConflictResolution({
        conflict,
        resolved: Boolean(selection.adapter),
        ...(selection.adapter ? { adapter: selection.adapter } : {}),
    });
}
export function resolveRendererAdapterRegistryConflictsWithFirstCandidate(registry) {
    return findRendererAdapterConflicts(registry)
        .map(resolveRendererAdapterConflictWithFirstCandidate);
}
export async function mountResolvedRendererAdapter(resolution, request) {
    if (!resolution.resolved || !resolution.adapter) {
        return createRendererMountResult({
            mounted: false,
            output: request.output,
            target: request.target,
        });
    }
    try {
        return await resolution.adapter.mount(request);
    }
    catch (error) {
        return createRendererMountResult({
            mounted: false,
            output: request.output,
            target: request.target,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
