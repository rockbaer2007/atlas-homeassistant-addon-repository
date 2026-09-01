import type { HomeAssistantIntegrationBoundary, HomeAssistantIntegrationLayer } from "./HomeAssistantIntegrationBoundary";
export interface HomeAssistantActivationGate {
    readonly active: true;
    readonly missingLayers: readonly HomeAssistantIntegrationLayer[];
    readonly publicApiClosed: boolean;
    readonly reason: string;
}
export declare function inspectHomeAssistantActivationGate(boundary: HomeAssistantIntegrationBoundary): HomeAssistantActivationGate;
