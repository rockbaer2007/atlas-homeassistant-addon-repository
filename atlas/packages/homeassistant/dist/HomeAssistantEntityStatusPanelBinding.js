import { renderHomeAssistantEntityStatusPanel } from "./HomeAssistantStatusPanel";
export function bindHomeAssistantEntityStatusPanel(request) {
    const dispose = request.transport.subscribe(async (entity) => {
        if (entity.entityId !== request.entityId) {
            return;
        }
        await renderHomeAssistantEntityStatusPanel({
            panel: request.panel,
            entity,
            element: request.element,
            tokens: request.tokens,
        });
    });
    return { dispose };
}
