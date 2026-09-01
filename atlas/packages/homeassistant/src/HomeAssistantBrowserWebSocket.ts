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

export type HomeAssistantBrowserWebSocketConstructor = new (
  url: string,
) => HomeAssistantBrowserWebSocketLike;

export function createBrowserHomeAssistantWebSocket(
  url: string,
  WebSocketConstructor: HomeAssistantBrowserWebSocketConstructor = globalThis.WebSocket as unknown as HomeAssistantBrowserWebSocketConstructor,
): HomeAssistantWebSocket {
  const socket = new WebSocketConstructor(url);
  const messageListeners = new Set<(data: string) => void | Promise<void>>();
  const closeListeners = new Set<(reason?: string) => void>();

  socket.onmessage = event => {
    for (const listener of messageListeners) {
      void listener(event.data);
    }
  };
  socket.onclose = event => {
    const reason = formatHomeAssistantBrowserWebSocketCloseReason(event);
    for (const listener of closeListeners) {
      listener(reason);
    }
  };

  return {
    send(data: string): void {
      socket.send(data);
    },
    close(): void {
      socket.close();
    },
    onMessage(listener): () => void {
      messageListeners.add(listener);
      return () => messageListeners.delete(listener);
    },
    onClose(listener): () => void {
      closeListeners.add(listener);
      return () => closeListeners.delete(listener);
    },
  };
}

function formatHomeAssistantBrowserWebSocketCloseReason(
  event: HomeAssistantBrowserWebSocketCloseEvent,
): string | undefined {
  if (event.reason) return event.reason;
  if (event.code === 1000) return "ATLAS connection closed normally.";
  return event.code ? `WebSocket closed with code ${event.code}.` : undefined;
}
