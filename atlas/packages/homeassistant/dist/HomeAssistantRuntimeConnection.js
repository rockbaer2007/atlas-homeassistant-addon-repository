import { deriveHomeAssistantWebSocketUrl, } from "./HomeAssistantConnectionConfiguration";
import { createHomeAssistantWebSocketClient, } from "./HomeAssistantWebSocketTransport";
export function createHomeAssistantRuntimeConnection(configuration, createSocket) {
    let client;
    let lifecycle = { state: "closed" };
    let removeClientLifecycleListener;
    const lifecycleListeners = new Set();
    const updateLifecycle = (nextLifecycle) => {
        lifecycle = nextLifecycle;
        for (const listener of lifecycleListeners) {
            listener(lifecycle);
        }
    };
    const connect = (accessToken) => {
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
        }
        catch (error) {
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
        reconnect(accessToken) {
            return connect(accessToken);
        },
        disconnect() {
            removeClientLifecycleListener?.();
            removeClientLifecycleListener = undefined;
            client?.disconnect();
            updateLifecycle({ state: "closed" });
        },
        getLifecycle() {
            return client?.getLifecycle() ?? lifecycle;
        },
        subscribeLifecycle(listener) {
            lifecycleListeners.add(listener);
            listener(lifecycle);
            return () => lifecycleListeners.delete(listener);
        },
        getClient() {
            return client;
        },
    };
}
