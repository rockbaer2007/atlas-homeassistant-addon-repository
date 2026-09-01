export function createHomeAssistantPanelGroup(group) {
    return { ...group, entityIds: [...group.entityIds] };
}
export function findHomeAssistantPanelGroup(groups, id) {
    return groups.find(group => group.id === id);
}
