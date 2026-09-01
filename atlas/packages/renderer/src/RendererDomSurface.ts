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

export function createRendererDomSurfaceRegistry(
  surfaces: readonly RendererDomSurface[] = [],
): RendererDomSurfaceRegistry {
  return {
    surfaces: [...surfaces],
  };
}

export function findRendererDomSurface(
  registry: RendererDomSurfaceRegistry,
  identifier: string,
): RendererDomSurfaceLookup {
  return {
    identifier,
    surface: registry.surfaces.find(surface => surface.identifier === identifier),
  };
}

export function mountRendererOutputToDomSurface(
  request: RendererMountRequest,
  registry: RendererDomSurfaceRegistry,
): RendererMountResult {
  if (request.target.kind !== "surface") {
    return {
      mounted: false,
      output: request.output,
      target: request.target,
      error: `Renderer DOM surface mounting requires a surface target, received ${request.target.kind}.`,
    };
  }

  if (!request.target.identifier) {
    return {
      mounted: false,
      output: request.output,
      target: request.target,
      error: "Renderer DOM surface mounting requires a target identifier.",
    };
  }

  const lookup = findRendererDomSurface(registry, request.target.identifier);

  if (!lookup.surface) {
    return {
      mounted: false,
      output: request.output,
      target: request.target,
      error: `Renderer DOM surface ${request.target.identifier} was not found.`,
    };
  }

  lookup.surface.element.innerHTML = request.output.content ?? "";

  return {
    mounted: true,
    output: request.output,
    target: request.target,
  };
}

export function createRendererDomSurfaceAdapter(
  name: string,
  registry: RendererDomSurfaceRegistry,
): RendererDomSurfaceAdapter {
  return {
    name,
    registry,
    mount(request: RendererMountRequest): RendererMountResult {
      return mountRendererOutputToDomSurface(request, registry);
    },
  };
}

export function executeRendererDomSurfaceScenario(
  scenario: RendererDomSurfaceScenario,
): RendererMountResult {
  return mountRendererOutputToDomSurface({
    output: scenario.output,
    target: scenario.target,
  }, scenario.registry);
}
