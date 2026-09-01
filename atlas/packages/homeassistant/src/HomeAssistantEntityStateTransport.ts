import type { HomeAssistantEntityState } from "./HomeAssistantEntityState";

export type HomeAssistantEntityStateListener = (
  entity: HomeAssistantEntityState,
) => void | Promise<void>;

export type HomeAssistantEntityStateTransport = Readonly<{
  subscribe(listener: HomeAssistantEntityStateListener): () => void;
}>;

export type HomeAssistantEntityStatePublisher = HomeAssistantEntityStateTransport & Readonly<{
  publish(entity: HomeAssistantEntityState): Promise<void>;
  getLatest(entityId: string): HomeAssistantEntityState | undefined;
}>;

export function createInMemoryHomeAssistantEntityStateTransport(): HomeAssistantEntityStatePublisher {
  const listeners = new Set<HomeAssistantEntityStateListener>();
  const entities = new Map<string, HomeAssistantEntityState>();

  return {
    subscribe(listener: HomeAssistantEntityStateListener): () => void {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    async publish(entity: HomeAssistantEntityState): Promise<void> {
      const publishedEntity = { ...entity };
      entities.set(publishedEntity.entityId, publishedEntity);

      for (const listener of listeners) {
        await listener(publishedEntity);
      }
    },
    getLatest(entityId: string): HomeAssistantEntityState | undefined {
      return entities.get(entityId);
    },
  };
}
