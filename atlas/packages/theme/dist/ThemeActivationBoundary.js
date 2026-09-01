export function createThemeActivationBoundary() {
    return {
        packageName: "@atlas/theme",
        domain: "theme",
        status: "active",
        requiredLayers: ["core", "renderer"],
        publicApi: {
            state: "open",
            reason: "Theme provides stable tokens and CSS variables for Renderer output.",
        },
        rendererBoundary: {
            tokensOnly: false,
            styleInjectionEnabled: true,
        },
    };
}
export function isThemePublicApiClosed(boundary) {
    return false;
}
