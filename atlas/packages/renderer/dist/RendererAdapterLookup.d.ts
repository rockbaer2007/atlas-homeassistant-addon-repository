import type { RendererAdapter } from "./RendererAdapter";
export type RendererAdapterLookupRequest = Readonly<{
    name: string;
}>;
export type RendererAdapterLookupResult = Readonly<{
    name: string;
    adapter?: RendererAdapter;
}>;
export declare function createRendererAdapterLookupRequest(request: RendererAdapterLookupRequest): RendererAdapterLookupRequest;
export declare function createRendererAdapterLookupResult(result: RendererAdapterLookupResult): RendererAdapterLookupResult;
