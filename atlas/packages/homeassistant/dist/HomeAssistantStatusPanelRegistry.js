export function createHomeAssistantStatusPanelRegistry(panels = []) {
    return { panels: [...panels] };
}
export function findHomeAssistantStatusPanel(registry, panelId) {
    return registry.panels.find(panel => panel.id === panelId);
}
