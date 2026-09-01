import type { RendererAdapter } from "./RendererAdapter";

export type RendererAdapterLookupRequest = Readonly<{
  name: string;
}>;

export type RendererAdapterLookupResult = Readonly<{
  name: string;
  adapter?: RendererAdapter;
}>;

export function createRendererAdapterLookupRequest(
  request: RendererAdapterLookupRequest,
): RendererAdapterLookupRequest {
  return {
    ...request,
  };
}

export function createRendererAdapterLookupResult(
  result: RendererAdapterLookupResult,
): RendererAdapterLookupResult {
  return {
    ...result,
  };
}
