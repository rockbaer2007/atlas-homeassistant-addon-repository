import type {
  ThemeActivationBoundary,
  ThemeActivationLayer,
} from "./ThemeActivationBoundary";
import { isThemePublicApiClosed } from "./ThemeActivationBoundary";

export interface ThemeActivationGate {
  readonly active: true;
  readonly missingLayers: readonly ThemeActivationLayer[];
  readonly publicApiClosed: boolean;
  readonly reason: string;
}

export function inspectThemeActivationGate(
  boundary: ThemeActivationBoundary,
): ThemeActivationGate {
  return {
    active: true,
    missingLayers: [],
    publicApiClosed: isThemePublicApiClosed(boundary),
    reason: boundary.publicApi.reason,
  };
}
