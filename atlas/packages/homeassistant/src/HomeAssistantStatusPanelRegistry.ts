import type { HomeAssistantStatusPanel } from "./HomeAssistantStatusPanel";

export type HomeAssistantStatusPanelRegistry = Readonly<{
  panels: readonly HomeAssistantStatusPanel[];
}>;

export function createHomeAssistantStatusPanelRegistry(
  panels: readonly HomeAssistantStatusPanel[] = [],
): HomeAssistantStatusPanelRegistry {
  return { panels: [...panels] };
}

export function findHomeAssistantStatusPanel(
  registry: HomeAssistantStatusPanelRegistry,
  panelId: string,
): HomeAssistantStatusPanel | undefined {
  return registry.panels.find(panel => panel.id === panelId);
}
