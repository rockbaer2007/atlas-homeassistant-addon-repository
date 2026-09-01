import type { RendererAdapter } from "./RendererAdapter";
import type { RendererMountRequest, RendererMountResult } from "./RendererMount";
import type { RendererOutput } from "./RendererOutput";
import type { RendererTarget } from "./RendererTarget";
export type RendererDomSurfaceElement = {
    innerHTML: string;
};
export type RendererDomSurface = Readonly<{
    identifier: string;
    element: RendererDomSurfaceElement;
}>;
export type RendererDomSurfaceRegistry = Readonly<{
    surfaces: readonly RendererDomSurface[];
}>;
export type RendererDomSurfaceLookup = Readonly<{
    identifier: string;
    surface?: RendererDomSurface;
}>;
export type RendererDomSurfaceScenario = Readonly<{
    output: RendererOutput;
    target: RendererTarget;
    registry: RendererDomSurfaceRegistry;
}>;
export type RendererDomSurfaceAdapter = RendererAdapter & Readonly<{
    registry: RendererDomSurfaceRegistry;
}>;
export declare function createRendererDomSurfaceRegistry(surfaces?: readonly RendererDomSurface[]): RendererDomSurfaceRegistry;
export declare function findRendererDomSurface(registry: RendererDomSurfaceRegistry, identifier: string): RendererDomSurfaceLookup;
export declare function mountRendererOutputToDomSurface(request: RendererMountRequest, registry: RendererDomSurfaceRegistry): RendererMountResult;
export declare function createRendererDomSurfaceAdapter(name: string, registry: RendererDomSurfaceRegistry): RendererDomSurfaceAdapter;
export declare function executeRendererDomSurfaceScenario(scenario: RendererDomSurfaceScenario): RendererMountResult;
