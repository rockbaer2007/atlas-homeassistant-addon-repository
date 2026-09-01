import { isHomeAssistantPublicApiClosed } from "./HomeAssistantIntegrationBoundary";
export function inspectHomeAssistantActivationGate(boundary) {
    return {
        active: true,
        missingLayers: [],
        publicApiClosed: isHomeAssistantPublicApiClosed(boundary),
        reason: boundary.publicApi.reason,
    };
}
