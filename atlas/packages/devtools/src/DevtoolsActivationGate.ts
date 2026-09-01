import type {
  DevtoolsActivationBoundary,
  DevtoolsActivationLayer,
} from "./DevtoolsActivationBoundary";
import { isDevtoolsPublicApiClosed } from "./DevtoolsActivationBoundary";

export interface DevtoolsActivationGate {
  readonly active: false;
  readonly missingLayers: readonly DevtoolsActivationLayer[];
  readonly publicApiClosed: boolean;
  readonly reason: string;
}

export function inspectDevtoolsActivationGate(
  boundary: DevtoolsActivationBoundary,
): DevtoolsActivationGate {
  return {
    active: false,
    missingLayers: [...boundary.requiredLayers],
    publicApiClosed: isDevtoolsPublicApiClosed(boundary),
    reason: boundary.publicApi.reason,
  };
}
