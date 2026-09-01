import {
  deriveHomeAssistantWebSocketUrl,
  type HomeAssistantConnectionConfiguration,
} from "./HomeAssistantConnectionConfiguration";
import type { HomeAssistantWebSocketLifecycle } from "./HomeAssistantWebSocketProtocol";
import {
  createHomeAssistantWebSocketClient,
  type HomeAssistantWebSocket,
  type HomeAssistantWebSocketClient,
} from "./HomeAssistantWebSocketTransport";

export type HomeAssistantWebSocketFactory = (url: string) => HomeAssistantWebSocket;

export type HomeAssistantRuntimeConnection = Readonly<{
  connect(accessToken: string): HomeAssistantWebSocketLifecycle;
  reconnect(accessToken: string): HomeAssistantWebSocketLifecycle;
  disconnect(): void;
  getLifecycle(): HomeAssistantWebSocketLifecycle;
  subscribeLifecycle(listener: (lifecycle: HomeAssistantWebSocketLifecycle) => void): () => void;
  getClient(): HomeAssistantWebSocketClient | undefined;
}>;

export function createHomeAssistantRuntimeConnection(
  configuration: HomeAssistantConnectionConfiguration,
  createSocket: HomeAssistantWebSocketFactory,
): HomeAssistantRuntimeConnection {
  let client: HomeAssistantWebSocketClient | undefined;
  let lifecycle: HomeAssistantWebSocketLifecycle = { state: "closed" };
  let removeClientLifecycleListener: (() => void) | undefined;
  const lifecycleListeners = new Set<(lifecycle: HomeAssistantWebSocketLifecycle) => void>();
  const updateLifecycle = (nextLifecycle: HomeAssistantWebSocketLifecycle): void => {
    lifecycle = nextLifecycle;
    for (const listener of lifecycleListeners) {
      listener(lifecycle);
    }
  };

  const connect = (accessToken: string): HomeAssistantWebSocketLifecycle => {
    const url = deriveHomeAssistantWebSocketUrl(configuration);
    if (!url) {
      updateLifecycle({
        state: "failed",
        reason: "Home Assistant connection requires an HTTP or HTTPS URL.",
      });
      return lifecycle;
    }

    removeClientLifecycleListener?.();
    client?.disconnect();
    try {
      client = createHomeAssistantWebSocketClient(createSocket(url), accessToken);
    } catch (error) {
      updateLifecycle({
        state: "failed",
        reason: error instanceof Error ? error.message : "Home Assistant connection could not be opened.",
      });
      return lifecycle;
    }
    removeClientLifecycleListener = client.subscribeLifecycle(updateLifecycle);
    return lifecycle;
  };

  return {
    connect,
    reconnect(accessToken: string): HomeAssistantWebSocketLifecycle {
      return connect(accessToken);
    },
    disconnect(): void {
      removeClientLifecycleListener?.();
      removeClientLifecycleListener = undefined;
      client?.disconnect();
      updateLifecycle({ state: "closed" });
    },
    getLifecycle(): HomeAssistantWebSocketLifecycle {
      return client?.getLifecycle() ?? lifecycle;
    },
    subscribeLifecycle(listener): () => void {
      lifecycleListeners.add(listener);
      listener(lifecycle);
      return () => lifecycleListeners.delete(listener);
    },
    getClient(): HomeAssistantWebSocketClient | undefined {
      return client;
    },
  };
}
