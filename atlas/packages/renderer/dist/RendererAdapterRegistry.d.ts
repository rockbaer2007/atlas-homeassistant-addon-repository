import type { RendererAdapter } from "./RendererAdapter";
import type { RendererAdapterLookupRequest, RendererAdapterLookupResult } from "./RendererAdapterLookup";
export type RendererAdapterRegistry = Readonly<{
    adapters: readonly RendererAdapter[];
}>;
export declare function createRendererAdapterRegistry(adapters: readonly RendererAdapter[]): RendererAdapterRegistry;
export declare function findRendererAdapter(registry: RendererAdapterRegistry, request: RendererAdapterLookupRequest): RendererAdapterLookupResult;
