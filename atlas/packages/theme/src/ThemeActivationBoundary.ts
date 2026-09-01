export type ThemeActivationLayer = "core" | "renderer";

export type ThemeActivationStatus = "active";

export type ThemePublicApiState = "open";

export interface ThemeActivationBoundary {
  readonly packageName: "@atlas/theme";
  readonly domain: "theme";
  readonly status: ThemeActivationStatus;
  readonly requiredLayers: readonly ThemeActivationLayer[];
  readonly publicApi: {
    readonly state: ThemePublicApiState;
    readonly reason: string;
  };
  readonly rendererBoundary: {
    readonly tokensOnly: false;
    readonly styleInjectionEnabled: true;
  };
}

export function createThemeActivationBoundary(): ThemeActivationBoundary {
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

export function isThemePublicApiClosed(boundary: ThemeActivationBoundary): boolean {
  return false;
}
