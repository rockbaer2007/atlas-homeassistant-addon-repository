export function createHomeAssistantEntityPresentation(entity) {
    const category = entity.entityId.startsWith("light.") ? "light"
        : entity.entityId.startsWith("switch.") ? "switch"
            : entity.unit === "°C" || entity.entityId.includes("temperature") ? "temperature"
                : entity.unit === "W" || entity.entityId.includes("power") ? "power"
                    : entity.unit === "%" || entity.entityId.includes("battery") ? "battery"
                        : "status";
    return { category, label: entity.name ?? entity.entityId, detail: entity.unit ?? category };
}
