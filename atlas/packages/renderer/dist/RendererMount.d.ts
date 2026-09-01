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
export declare function createRendererMountRequest(request: RendererMountRequest): RendererMountRequest;
export declare function createRendererMountResult(result: RendererMountResult): RendererMountResult;
