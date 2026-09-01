import type { ThemeRendererStatus } from "@atlas/theme";

export type HomeAssistantEntityStateValue = "on" | "off" | "available" | "unavailable" | "unknown";

export type HomeAssistantEntityState = Readonly<{
  entityId: string;
  state: HomeAssistantEntityStateValue;
  value?: string;
  name?: string;
  unit?: string;
}>;

export function createHomeAssistantEntityState(
  entity: HomeAssistantEntityState,
): HomeAssistantEntityState {
  return { ...entity };
}

export function mapHomeAssistantEntityStateToStatus(
  entity: HomeAssistantEntityState,
): ThemeRendererStatus {
  if (entity.state === "on" || entity.state === "available") {
    return "ready";
  }

  if (entity.state === "off") {
    return "pending";
  }

  return "blocked";
}
