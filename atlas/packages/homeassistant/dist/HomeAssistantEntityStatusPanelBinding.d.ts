import type { ThemeRendererSurfaceElement, ThemeTokens } from "@atlas/theme";
import type { HomeAssistantEntityStateTransport } from "./HomeAssistantEntityStateTransport";
import type { HomeAssistantStatusPanel } from "./HomeAssistantStatusPanel";
export type HomeAssistantEntityStatusPanelBinding = Readonly<{
    dispose(): void;
}>;
export type HomeAssistantEntityStatusPanelBindingRequest = Readonly<{
    transport: HomeAssistantEntityStateTransport;
    panel: HomeAssistantStatusPanel;
    entityId: string;
    element: ThemeRendererSurfaceElement;
    tokens: ThemeTokens;
}>;
export declare function bindHomeAssistantEntityStatusPanel(request: HomeAssistantEntityStatusPanelBindingRequest): HomeAssistantEntityStatusPanelBinding;
