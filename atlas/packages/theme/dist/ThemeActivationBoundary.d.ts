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
export declare function createThemeActivationBoundary(): ThemeActivationBoundary;
export declare function isThemePublicApiClosed(boundary: ThemeActivationBoundary): boolean;
