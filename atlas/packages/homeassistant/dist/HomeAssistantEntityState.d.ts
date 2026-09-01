import type { ThemeRendererStatus } from "@atlas/theme";
export type HomeAssistantEntityStateValue = "on" | "off" | "available" | "unavailable" | "unknown";
export type HomeAssistantEntityState = Readonly<{
    entityId: string;
    state: HomeAssistantEntityStateValue;
    value?: string;
    name?: string;
    unit?: string;
}>;
export declare function createHomeAssistantEntityState(entity: HomeAssistantEntityState): HomeAssistantEntityState;
export declare function mapHomeAssistantEntityStateToStatus(entity: HomeAssistantEntityState): ThemeRendererStatus;
