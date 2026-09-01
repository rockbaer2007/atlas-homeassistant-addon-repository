export function createHomeAssistantEntityState(entity) {
    return { ...entity };
}
export function mapHomeAssistantEntityStateToStatus(entity) {
    if (entity.state === "on" || entity.state === "available") {
        return "ready";
    }
    if (entity.state === "off") {
        return "pending";
    }
    return "blocked";
}
