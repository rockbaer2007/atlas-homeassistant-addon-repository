export function createHomeAssistantBrightnessCommand(entityId, brightnessPercent) {
    if (!entityId.startsWith("light.") || !Number.isInteger(brightnessPercent) || brightnessPercent < 1 || brightnessPercent > 100) {
        return undefined;
    }
    return { entityId, domain: "light", service: "turn_on", brightnessPercent };
}
export function isHomeAssistantControllableEntityId(entityId) {
    return entityId.startsWith("light.") || entityId.startsWith("switch.");
}
export function createHomeAssistantServiceCommand(entityId, service) {
    const domain = entityId.split(".", 1)[0];
    if ((domain !== "light" && domain !== "switch") || !entityId.slice(domain.length + 1)) {
        return undefined;
    }
    return { entityId, domain, service };
}
