import { isThemePublicApiClosed } from "./ThemeActivationBoundary";
export function inspectThemeActivationGate(boundary) {
    return {
        active: true,
        missingLayers: [],
        publicApiClosed: isThemePublicApiClosed(boundary),
        reason: boundary.publicApi.reason,
    };
}
