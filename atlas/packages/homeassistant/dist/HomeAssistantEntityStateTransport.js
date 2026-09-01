export function createInMemoryHomeAssistantEntityStateTransport() {
    const listeners = new Set();
    const entities = new Map();
    return {
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        async publish(entity) {
            const publishedEntity = { ...entity };
            entities.set(publishedEntity.entityId, publishedEntity);
            for (const listener of listeners) {
                await listener(publishedEntity);
            }
        },
        getLatest(entityId) {
            return entities.get(entityId);
        },
    };
}
