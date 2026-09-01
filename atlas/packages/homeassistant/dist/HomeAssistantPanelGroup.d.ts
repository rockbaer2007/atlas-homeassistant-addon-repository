export type HomeAssistantPanelGroup = Readonly<{
    id: string;
    title: string;
    entityIds: readonly string[];
}>;
export declare function createHomeAssistantPanelGroup(group: HomeAssistantPanelGroup): HomeAssistantPanelGroup;
export declare function findHomeAssistantPanelGroup(groups: readonly HomeAssistantPanelGroup[], id: string): HomeAssistantPanelGroup | undefined;
