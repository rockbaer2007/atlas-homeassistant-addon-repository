import type { HomeAssistantEntityStatePublisher } from "./HomeAssistantEntityStateTransport";
import { type HomeAssistantWebSocketLifecycle } from "./HomeAssistantWebSocketProtocol";
import type { HomeAssistantEntityState } from "./HomeAssistantEntityState";
import type { HomeAssistantLovelaceResource } from "./HomeAssistantCardConfiguration";
import { type HomeAssistantServiceCommand } from "./HomeAssistantServiceCommand";
export type HomeAssistantWebSocket = Readonly<{
    send(data: string): void;
    close(): void;
    onMessage(listener: (data: string) => void | Promise<void>): () => void;
    onClose(listener: (reason?: string) => void): () => void;
}>;
export type HomeAssistantWebSocketClient = Readonly<{
    transport: HomeAssistantEntityStatePublisher;
    getLifecycle(): HomeAssistantWebSocketLifecycle;
    subscribeLifecycle(listener: (lifecycle: HomeAssistantWebSocketLifecycle) => void): () => void;
    requestEntityStates(): HomeAssistantEntityStateRequestResult;
    subscribeEntityStateList(listener: (result: HomeAssistantEntityStateListResult) => void): () => void;
    requestLovelaceResources(command?: HomeAssistantLovelaceResourceCommand): HomeAssistantLovelaceResourceRequestResult;
    subscribeLovelaceResources(listener: (result: HomeAssistantLovelaceResourceListResult) => void): () => void;
    callService(command: HomeAssistantServiceCommand): HomeAssistantServiceCallResult;
    subscribeServiceResult(listener: (result: HomeAssistantServiceResult) => void): () => void;
    disconnect(): void;
}>;
export type HomeAssistantServiceCallResult = Readonly<{
    accepted: boolean;
    requestId?: number;
    reason?: string;
}>;
export type HomeAssistantEntityStateRequestResult = Readonly<{
    accepted: boolean;
    requestId?: number;
    reason?: string;
}>;
export type HomeAssistantEntityStateListResult = Readonly<{
    requestId: number;
    entities: readonly HomeAssistantEntityState[];
    success: boolean;
    reason?: string;
}>;
export type HomeAssistantLovelaceResourceRequestResult = Readonly<{
    accepted: boolean;
    requestId?: number;
    command?: HomeAssistantLovelaceResourceCommand;
    reason?: string;
}>;
export type HomeAssistantLovelaceResourceCommand = "lovelace/resources" | "lovelace/resources/list";
export type HomeAssistantLovelaceResourceListResult = Readonly<{
    requestId: number;
    command?: HomeAssistantLovelaceResourceCommand;
    resources: readonly HomeAssistantLovelaceResource[];
    success: boolean;
    reason?: string;
}>;
export type HomeAssistantServiceResult = Readonly<{
    requestId: number;
    command: HomeAssistantServiceCommand;
    success: boolean;
    reason?: string;
}>;
export declare function createHomeAssistantWebSocketClient(socket: HomeAssistantWebSocket, accessToken: string): HomeAssistantWebSocketClient;
