import type { RendererPlatformAdapter } from "./RendererPlatformAdapter";
export type RendererPlatformAdapterLookupRequest = Readonly<{
    platform: string;
}>;
export type RendererPlatformAdapterLookupResult = Readonly<{
    platform: string;
    platformAdapter?: RendererPlatformAdapter;
}>;
export declare function createRendererPlatformAdapterLookupRequest(request: RendererPlatformAdapterLookupRequest): RendererPlatformAdapterLookupRequest;
export declare function createRendererPlatformAdapterLookupResult(result: RendererPlatformAdapterLookupResult): RendererPlatformAdapterLookupResult;
