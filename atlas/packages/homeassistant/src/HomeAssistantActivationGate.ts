import type {
  HomeAssistantIntegrationBoundary,
  HomeAssistantIntegrationLayer,
} from "./HomeAssistantIntegrationBoundary";
import { isHomeAssistantPublicApiClosed } from "./HomeAssistantIntegrationBoundary";

export interface HomeAssistantActivationGate {
  readonly active: true;
  readonly missingLayers: readonly HomeAssistantIntegrationLayer[];
  readonly publicApiClosed: boolean;
  readonly reason: string;
}

export function inspectHomeAssistantActivationGate(
  boundary: HomeAssistantIntegrationBoundary,
): HomeAssistantActivationGate {
  return {
    active: true,
    missingLayers: [],
    publicApiClosed: isHomeAssistantPublicApiClosed(boundary),
    reason: boundary.publicApi.reason,
  };
}
