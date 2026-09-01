export type HomeAssistantControllableDomain = "light" | "switch";
export type HomeAssistantControllableService = "turn_on" | "turn_off";

export type HomeAssistantServiceCommand = Readonly<{
  entityId: string;
  domain: HomeAssistantControllableDomain;
  service: HomeAssistantControllableService;
  brightnessPercent?: number;
}>;

export function createHomeAssistantBrightnessCommand(
  entityId: string,
  brightnessPercent: number,
): HomeAssistantServiceCommand | undefined {
  if (!entityId.startsWith("light.") || !Number.isInteger(brightnessPercent) || brightnessPercent < 1 || brightnessPercent > 100) {
    return undefined;
  }

  return { entityId, domain: "light", service: "turn_on", brightnessPercent };
}

export function isHomeAssistantControllableEntityId(entityId: string): boolean {
  return entityId.startsWith("light.") || entityId.startsWith("switch.");
}

export function createHomeAssistantServiceCommand(
  entityId: string,
  service: HomeAssistantControllableService,
): HomeAssistantServiceCommand | undefined {
  const domain = entityId.split(".", 1)[0];
  if ((domain !== "light" && domain !== "switch") || !entityId.slice(domain.length + 1)) {
    return undefined;
  }

  return { entityId, domain, service };
}
