export function createHomeAssistantIntegrationBoundary() {
    return {
        packageName: "@atlas/homeassistant",
        integration: "home-assistant",
        status: "active",
        requiredLayers: ["runtime", "renderer", "theme"],
        publicApi: {
            state: "open",
            reason: "Home Assistant provides a themed status panel on the active Renderer surface path.",
        },
        rendererBoundary: {
            platformMetadataOnly: false,
            concreteMountingEnabled: true,
        },
    };
}
export function isHomeAssistantPublicApiClosed(boundary) {
    return false;
}
