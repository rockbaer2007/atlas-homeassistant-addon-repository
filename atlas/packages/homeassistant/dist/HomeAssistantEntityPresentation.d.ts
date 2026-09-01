import type { HomeAssistantEntityState } from "./HomeAssistantEntityState";
export type HomeAssistantEntityPresentation = Readonly<{
    category: "temperature" | "power" | "battery" | "light" | "switch" | "status";
    label: string;
    detail: string;
}>;
export declare function createHomeAssistantEntityPresentation(entity: HomeAssistantEntityState): HomeAssistantEntityPresentation;
