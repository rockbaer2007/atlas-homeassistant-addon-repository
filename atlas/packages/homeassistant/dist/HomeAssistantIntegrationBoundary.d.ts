export type HomeAssistantIntegrationLayer = "runtime" | "renderer" | "theme";
export type HomeAssistantIntegrationStatus = "active";
export type HomeAssistantPublicApiState = "open";
export interface HomeAssistantIntegrationBoundary {
    readonly packageName: "@atlas/homeassistant";
    readonly integration: "home-assistant";
    readonly status: HomeAssistantIntegrationStatus;
    readonly requiredLayers: readonly HomeAssistantIntegrationLayer[];
    readonly publicApi: {
        readonly state: HomeAssistantPublicApiState;
        readonly reason: string;
    };
    readonly rendererBoundary: {
        readonly platformMetadataOnly: false;
        readonly concreteMountingEnabled: true;
    };
}
export declare function createHomeAssistantIntegrationBoundary(): HomeAssistantIntegrationBoundary;
export declare function isHomeAssistantPublicApiClosed(boundary: HomeAssistantIntegrationBoundary): boolean;
