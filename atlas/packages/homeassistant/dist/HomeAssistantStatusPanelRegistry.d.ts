import type { HomeAssistantStatusPanel } from "./HomeAssistantStatusPanel";
export type HomeAssistantStatusPanelRegistry = Readonly<{
    panels: readonly HomeAssistantStatusPanel[];
}>;
export declare function createHomeAssistantStatusPanelRegistry(panels?: readonly HomeAssistantStatusPanel[]): HomeAssistantStatusPanelRegistry;
export declare function findHomeAssistantStatusPanel(registry: HomeAssistantStatusPanelRegistry, panelId: string): HomeAssistantStatusPanel | undefined;
