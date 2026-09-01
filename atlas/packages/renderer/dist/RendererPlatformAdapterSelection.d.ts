import type { RendererPlatformAdapter } from "./RendererPlatformAdapter";
export type RendererPlatformAdapterSelectionRequest = Readonly<{
    platform: string;
    candidates: readonly RendererPlatformAdapter[];
}>;
export type RendererPlatformAdapterSelectionResult = Readonly<{
    platform: string;
    platformAdapter?: RendererPlatformAdapter;
}>;
export declare function createRendererPlatformAdapterSelectionRequest(request: RendererPlatformAdapterSelectionRequest): RendererPlatformAdapterSelectionRequest;
export declare function createRendererPlatformAdapterSelectionResult(result: RendererPlatformAdapterSelectionResult): RendererPlatformAdapterSelectionResult;
export declare function selectFirstRendererPlatformAdapterCandidate(request: RendererPlatformAdapterSelectionRequest): RendererPlatformAdapterSelectionResult;
