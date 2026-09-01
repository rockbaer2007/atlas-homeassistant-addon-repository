import { createRendererAdapterLookupResult } from "./RendererAdapterLookup";
export function createRendererAdapterRegistry(adapters) {
    return {
        adapters: [...adapters],
    };
}
export function findRendererAdapter(registry, request) {
    const adapter = registry.adapters.find(candidate => candidate.name === request.name);
    return createRendererAdapterLookupResult({
        name: request.name,
        ...(adapter ? { adapter } : {}),
    });
}
