import { executeThemedRendererDomSurfaceScenario, type ThemeRendererStatus, type ThemeRendererSurfaceElement, type ThemeTokens } from "@atlas/theme";
import { type HomeAssistantEntityState } from "./HomeAssistantEntityState";
import type { HomeAssistantWebSocketLifecycle } from "./HomeAssistantWebSocketProtocol";
export type HomeAssistantStatusPanel = Readonly<{
    id: string;
    title: string;
    targetIdentifier: string;
}>;
export type HomeAssistantStatusPanelScenario = Readonly<{
    panel: HomeAssistantStatusPanel;
    status: ThemeRendererStatus;
    element: ThemeRendererSurfaceElement;
    tokens: ThemeTokens;
    title?: string;
    detail?: string;
}>;
export type HomeAssistantEntityStatusPanelScenario = Readonly<{
    panel: HomeAssistantStatusPanel;
    entity: HomeAssistantEntityState;
    element: ThemeRendererSurfaceElement;
    tokens: ThemeTokens;
}>;
export declare function createHomeAssistantStatusPanel(panel: HomeAssistantStatusPanel): HomeAssistantStatusPanel;
export declare function renderHomeAssistantStatusPanel(scenario: HomeAssistantStatusPanelScenario): ReturnType<typeof executeThemedRendererDomSurfaceScenario>;
export declare function renderHomeAssistantEntityStatusPanel(scenario: HomeAssistantEntityStatusPanelScenario): ReturnType<typeof renderHomeAssistantStatusPanel>;
export declare function mapHomeAssistantConnectionLifecycleToStatus(lifecycle: HomeAssistantWebSocketLifecycle): ThemeRendererStatus;
