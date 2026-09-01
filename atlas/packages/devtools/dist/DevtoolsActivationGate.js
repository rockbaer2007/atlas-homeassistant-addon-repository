import { isDevtoolsPublicApiClosed } from "./DevtoolsActivationBoundary";
export function inspectDevtoolsActivationGate(boundary) {
    return {
        active: false,
        missingLayers: [...boundary.requiredLayers],
        publicApiClosed: isDevtoolsPublicApiClosed(boundary),
        reason: boundary.publicApi.reason,
    };
}
