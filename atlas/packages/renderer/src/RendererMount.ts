import type { RendererOutput } from "./RendererOutput";
import type { RendererTarget } from "./RendererTarget";

export type RendererMountRequest = Readonly<{
  output: RendererOutput;
  target: RendererTarget;
}>;

export type RendererMountResult = Readonly<{
  mounted: boolean;
  output: RendererOutput;
  target: RendererTarget;
  error?: string;
}>;

export function createRendererMountRequest(
  request: RendererMountRequest,
): RendererMountRequest {
  return {
    ...request,
  };
}

export function createRendererMountResult(
  result: RendererMountResult,
): RendererMountResult {
  return {
    ...result,
  };
}
