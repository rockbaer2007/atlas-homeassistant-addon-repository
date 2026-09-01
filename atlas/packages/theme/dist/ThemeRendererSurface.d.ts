import { type RendererOutput, type RendererTarget, type RendererUnifiedMountExecution } from "@atlas/renderer";
import { type ThemeStyleTarget, type ThemeTokens } from "./ThemeTokens";
export type ThemeRendererStatus = "ready" | "blocked" | "pending";
export type ThemeRendererStatusOutputOptions = Readonly<{
    title?: string;
    detail?: string;
}>;
export type ThemeRendererSurfaceElement = ThemeStyleTarget & Readonly<{
    innerHTML: string;
}>;
export type ThemedRendererDomSurfaceScenario = Readonly<{
    output: RendererOutput;
    target: RendererTarget;
    element: ThemeRendererSurfaceElement;
    tokens: ThemeTokens;
}>;
export declare function createThemeRendererStatusOutput(status: ThemeRendererStatus, options?: ThemeRendererStatusOutputOptions): RendererOutput;
export declare function executeThemedRendererDomSurfaceScenario(scenario: ThemedRendererDomSurfaceScenario): Promise<RendererUnifiedMountExecution>;
