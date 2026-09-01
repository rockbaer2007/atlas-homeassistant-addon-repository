import type { ThemeActivationBoundary, ThemeActivationLayer } from "./ThemeActivationBoundary";
export interface ThemeActivationGate {
    readonly active: true;
    readonly missingLayers: readonly ThemeActivationLayer[];
    readonly publicApiClosed: boolean;
    readonly reason: string;
}
export declare function inspectThemeActivationGate(boundary: ThemeActivationBoundary): ThemeActivationGate;
