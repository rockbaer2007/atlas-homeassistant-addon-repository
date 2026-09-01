import type { RendererPlatformAdapter } from "./RendererPlatformAdapter";

export type RendererPlatformAdapterSelectionRequest = Readonly<{
  platform: string;
  candidates: readonly RendererPlatformAdapter[];
}>;

export type RendererPlatformAdapterSelectionResult = Readonly<{
  platform: string;
  platformAdapter?: RendererPlatformAdapter;
}>;

export function createRendererPlatformAdapterSelectionRequest(
  request: RendererPlatformAdapterSelectionRequest,
): RendererPlatformAdapterSelectionRequest {
  return {
    ...request,
    candidates: [...request.candidates],
  };
}

export function createRendererPlatformAdapterSelectionResult(
  result: RendererPlatformAdapterSelectionResult,
): RendererPlatformAdapterSelectionResult {
  return {
    ...result,
  };
}

export function selectFirstRendererPlatformAdapterCandidate(
  request: RendererPlatformAdapterSelectionRequest,
): RendererPlatformAdapterSelectionResult {
  const platformAdapter = request.candidates[0];

  return createRendererPlatformAdapterSelectionResult({
    platform: request.platform,
    ...(platformAdapter ? { platformAdapter } : {}),
  });
}
