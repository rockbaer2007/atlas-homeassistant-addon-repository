import type { RendererAdapter } from "./RendererAdapter";
export type RendererAdapterSelectionRequest = Readonly<{
    name: string;
    candidates: readonly RendererAdapter[];
}>;
export type RendererAdapterSelectionResult = Readonly<{
    name: string;
    adapter?: RendererAdapter;
}>;
export declare function createRendererAdapterSelectionRequest(request: RendererAdapterSelectionRequest): RendererAdapterSelectionRequest;
export declare function createRendererAdapterSelectionResult(result: RendererAdapterSelectionResult): RendererAdapterSelectionResult;
export declare function selectFirstRendererAdapterCandidate(request: RendererAdapterSelectionRequest): RendererAdapterSelectionResult;
