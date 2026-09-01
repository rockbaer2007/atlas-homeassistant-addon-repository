export function createRendererDomSurfaceRegistry(surfaces = []) {
    return {
        surfaces: [...surfaces],
    };
}
export function findRendererDomSurface(registry, identifier) {
    return {
        identifier,
        surface: registry.surfaces.find(surface => surface.identifier === identifier),
    };
}
export function mountRendererOutputToDomSurface(request, registry) {
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
export function createRendererDomSurfaceAdapter(name, registry) {
    return {
        name,
        registry,
        mount(request) {
            return mountRendererOutputToDomSurface(request, registry);
        },
    };
}
export function executeRendererDomSurfaceScenario(scenario) {
    return mountRendererOutputToDomSurface({
        output: scenario.output,
        target: scenario.target,
    }, scenario.registry);
}
