import type { HomeAssistantEntityState } from "./HomeAssistantEntityState";
export type HomeAssistantEntityStateListener = (entity: HomeAssistantEntityState) => void | Promise<void>;
export type HomeAssistantEntityStateTransport = Readonly<{
    subscribe(listener: HomeAssistantEntityStateListener): () => void;
}>;
export type HomeAssistantEntityStatePublisher = HomeAssistantEntityStateTransport & Readonly<{
    publish(entity: HomeAssistantEntityState): Promise<void>;
    getLatest(entityId: string): HomeAssistantEntityState | undefined;
}>;
export declare function createInMemoryHomeAssistantEntityStateTransport(): HomeAssistantEntityStatePublisher;
