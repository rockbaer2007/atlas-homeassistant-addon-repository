import type { RendererAdapter } from "./RendererAdapter";

export type RendererAdapterSelectionRequest = Readonly<{
  name: string;
  candidates: readonly RendererAdapter[];
}>;

export type RendererAdapterSelectionResult = Readonly<{
  name: string;
  adapter?: RendererAdapter;
}>;

export function createRendererAdapterSelectionRequest(
  request: RendererAdapterSelectionRequest,
): RendererAdapterSelectionRequest {
  return {
    ...request,
    candidates: [...request.candidates],
  };
}

export function createRendererAdapterSelectionResult(
  result: RendererAdapterSelectionResult,
): RendererAdapterSelectionResult {
  return {
    ...result,
  };
}

export function selectFirstRendererAdapterCandidate(
  request: RendererAdapterSelectionRequest,
): RendererAdapterSelectionResult {
  const adapter = request.candidates[0];

  return createRendererAdapterSelectionResult({
    name: request.name,
    ...(adapter ? { adapter } : {}),
  });
}
