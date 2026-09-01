import { type HomeAssistantConnectionConfiguration } from "./HomeAssistantConnectionConfiguration";
import type { HomeAssistantWebSocketLifecycle } from "./HomeAssistantWebSocketProtocol";
import { type HomeAssistantWebSocket, type HomeAssistantWebSocketClient } from "./HomeAssistantWebSocketTransport";
export type HomeAssistantWebSocketFactory = (url: string) => HomeAssistantWebSocket;
export type HomeAssistantRuntimeConnection = Readonly<{
    connect(accessToken: string): HomeAssistantWebSocketLifecycle;
    reconnect(accessToken: string): HomeAssistantWebSocketLifecycle;
    disconnect(): void;
    getLifecycle(): HomeAssistantWebSocketLifecycle;
    subscribeLifecycle(listener: (lifecycle: HomeAssistantWebSocketLifecycle) => void): () => void;
    getClient(): HomeAssistantWebSocketClient | undefined;
}>;
export declare function createHomeAssistantRuntimeConnection(configuration: HomeAssistantConnectionConfiguration, createSocket: HomeAssistantWebSocketFactory): HomeAssistantRuntimeConnection;
