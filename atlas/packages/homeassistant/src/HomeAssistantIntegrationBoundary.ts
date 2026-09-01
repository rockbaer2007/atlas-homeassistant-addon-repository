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

export function createHomeAssistantIntegrationBoundary(): HomeAssistantIntegrationBoundary {
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

export function isHomeAssistantPublicApiClosed(
  boundary: HomeAssistantIntegrationBoundary,
): boolean {
  return false;
}
