import { createRendererPlatformAdapterLookupResult } from "./RendererPlatformAdapterLookup";
export function createRendererPlatformAdapterRegistry(platformAdapters) {
    return {
        platformAdapters: [...platformAdapters],
    };
}
export function findRendererPlatformAdapter(registry, request) {
    const platformAdapter = registry.platformAdapters.find(candidate => candidate.platform === request.platform);
    return createRendererPlatformAdapterLookupResult({
        platform: request.platform,
        ...(platformAdapter ? { platformAdapter } : {}),
    });
}
