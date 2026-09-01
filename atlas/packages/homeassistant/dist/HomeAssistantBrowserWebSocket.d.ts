import type { HomeAssistantWebSocket } from "./HomeAssistantWebSocketTransport";
export type HomeAssistantBrowserWebSocketEvent = Readonly<{
    data: string;
}>;
export type HomeAssistantBrowserWebSocketCloseEvent = Readonly<{
    code?: number;
    reason?: string;
}>;
export type HomeAssistantBrowserWebSocketLike = {
    onmessage: ((event: HomeAssistantBrowserWebSocketEvent) => void) | null;
    onclose: ((event: HomeAssistantBrowserWebSocketCloseEvent) => void) | null;
    send(data: string): void;
    close(): void;
};
export type HomeAssistantBrowserWebSocketConstructor = new (url: string) => HomeAssistantBrowserWebSocketLike;
export declare function createBrowserHomeAssistantWebSocket(url: string, WebSocketConstructor?: HomeAssistantBrowserWebSocketConstructor): HomeAssistantWebSocket;
