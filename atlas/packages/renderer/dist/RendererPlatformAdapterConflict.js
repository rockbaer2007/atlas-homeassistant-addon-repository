import { createRendererMountResult, } from "./RendererMount";
import { createRendererPlatformAdapterSelectionRequest, selectFirstRendererPlatformAdapterCandidate, } from "./RendererPlatformAdapterSelection";
export function createRendererPlatformAdapterConflict(conflict) {
    return {
        ...conflict,
        platformAdapters: [...conflict.platformAdapters],
    };
}
export function createRendererPlatformAdapterConflictResolution(resolution) {
    return {
        ...resolution,
        conflict: createRendererPlatformAdapterConflict(resolution.conflict),
    };
}
export function findRendererPlatformAdapterConflicts(registry) {
    const platformAdaptersByPlatform = new Map();
    for (const platformAdapter of registry.platformAdapters) {
        const platformAdapters = platformAdaptersByPlatform.get(platformAdapter.platform) ?? [];
        platformAdapters.push(platformAdapter);
        platformAdaptersByPlatform.set(platformAdapter.platform, platformAdapters);
    }
    return [...platformAdaptersByPlatform.entries()]
        .filter(([, platformAdapters]) => platformAdapters.length > 1)
        .map(([platform, platformAdapters]) => createRendererPlatformAdapterConflict({
        platform,
        platformAdapters,
    }));
}
export function resolveRendererPlatformAdapterConflictWithFirstCandidate(conflict) {
    const selection = selectFirstRendererPlatformAdapterCandidate(createRendererPlatformAdapterSelectionRequest({
        platform: conflict.platform,
        candidates: conflict.platformAdapters,
    }));
    return createRendererPlatformAdapterConflictResolution({
        conflict,
        resolved: Boolean(selection.platformAdapter),
        ...(selection.platformAdapter ? { platformAdapter: selection.platformAdapter } : {}),
    });
}
export function resolveRendererPlatformAdapterRegistryConflictsWithFirstCandidate(registry) {
    return findRendererPlatformAdapterConflicts(registry)
        .map(resolveRendererPlatformAdapterConflictWithFirstCandidate);
}
export async function mountResolvedRendererPlatformAdapter(resolution, request) {
    if (!resolution.resolved || !resolution.platformAdapter) {
        return createRendererMountResult({
            mounted: false,
            output: request.output,
            target: request.target,
        });
    }
    try {
        return await resolution.platformAdapter.adapter.mount(request);
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
