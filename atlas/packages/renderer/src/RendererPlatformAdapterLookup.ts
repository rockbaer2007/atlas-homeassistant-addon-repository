import type { RendererPlatformAdapter } from "./RendererPlatformAdapter";

export type RendererPlatformAdapterLookupRequest = Readonly<{
  platform: string;
}>;

export type RendererPlatformAdapterLookupResult = Readonly<{
  platform: string;
  platformAdapter?: RendererPlatformAdapter;
}>;

export function createRendererPlatformAdapterLookupRequest(
  request: RendererPlatformAdapterLookupRequest,
): RendererPlatformAdapterLookupRequest {
  return {
    ...request,
  };
}

export function createRendererPlatformAdapterLookupResult(
  result: RendererPlatformAdapterLookupResult,
): RendererPlatformAdapterLookupResult {
  return {
    ...result,
  };
}
