import type { RendererPlatformAdapter } from "./RendererPlatformAdapter";
import type { RendererPlatformAdapterLookupRequest, RendererPlatformAdapterLookupResult } from "./RendererPlatformAdapterLookup";
export type RendererPlatformAdapterRegistry = Readonly<{
    platformAdapters: readonly RendererPlatformAdapter[];
}>;
export declare function createRendererPlatformAdapterRegistry(platformAdapters: readonly RendererPlatformAdapter[]): RendererPlatformAdapterRegistry;
export declare function findRendererPlatformAdapter(registry: RendererPlatformAdapterRegistry, request: RendererPlatformAdapterLookupRequest): RendererPlatformAdapterLookupResult;
