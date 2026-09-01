export type HomeAssistantPanelGroup = Readonly<{
  id: string;
  title: string;
  entityIds: readonly string[];
}>;

export function createHomeAssistantPanelGroup(group: HomeAssistantPanelGroup): HomeAssistantPanelGroup {
  return { ...group, entityIds: [...group.entityIds] };
}

export function findHomeAssistantPanelGroup(
  groups: readonly HomeAssistantPanelGroup[],
  id: string,
): HomeAssistantPanelGroup | undefined {
  return groups.find(group => group.id === id);
}
