import type { HomeAssistantEntityState } from "./HomeAssistantEntityState";

export type HomeAssistantEntityPresentation = Readonly<{
  category: "temperature" | "power" | "battery" | "light" | "switch" | "status";
  label: string;
  detail: string;
}>;

export function createHomeAssistantEntityPresentation(
  entity: HomeAssistantEntityState,
): HomeAssistantEntityPresentation {
  const category = entity.entityId.startsWith("light.") ? "light"
    : entity.entityId.startsWith("switch.") ? "switch"
      : entity.unit === "°C" || entity.entityId.includes("temperature") ? "temperature"
        : entity.unit === "W" || entity.entityId.includes("power") ? "power"
          : entity.unit === "%" || entity.entityId.includes("battery") ? "battery"
            : "status";

  return { category, label: entity.name ?? entity.entityId, detail: entity.unit ?? category };
}
