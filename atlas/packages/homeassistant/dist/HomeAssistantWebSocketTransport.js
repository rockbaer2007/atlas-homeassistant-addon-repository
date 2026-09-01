import { createInMemoryHomeAssistantEntityStateTransport } from "./HomeAssistantEntityStateTransport";
import { mapHomeAssistantStateResult, mapHomeAssistantStateChangedEvent, parseHomeAssistantWebSocketMessage, } from "./HomeAssistantWebSocketProtocol";
import { createHomeAssistantServiceCommand, } from "./HomeAssistantServiceCommand";
export function createHomeAssistantWebSocketClient(socket, accessToken) {
    const transport = createInMemoryHomeAssistantEntityStateTransport();
    let lifecycle = { state: "connecting" };
    let nextRequestId = 2;
    const lifecycleListeners = new Set();
    const serviceResultListeners = new Set();
    const entityStateListListeners = new Set();
    const lovelaceResourceListeners = new Set();
    const pendingServiceCommands = new Map();
    const pendingEntityStateRequests = new Set();
    const pendingLovelaceResourceRequests = new Map();
    const updateLifecycle = (nextLifecycle) => {
        lifecycle = nextLifecycle;
        for (const listener of lifecycleListeners) {
            listener(lifecycle);
        }
    };
    const removeMessageListener = socket.onMessage(async (data) => {
        const message = parseHomeAssistantWebSocketMessage(data);
        if (!message) {
            return;
        }
        if (message.type === "auth_required") {
            updateLifecycle({ state: "authenticating" });
            socket.send(JSON.stringify({ type: "auth", access_token: accessToken }));
            return;
        }
        if (message.type === "auth_ok") {
            socket.send(JSON.stringify({ id: 1, type: "subscribe_events", event_type: "state_changed" }));
            updateLifecycle({ state: "connected", subscription: "pending" });
            return;
        }
        if (message.type === "auth_invalid") {
            updateLifecycle({ state: "failed", reason: message.message });
            return;
        }
        if (message.type === "result") {
            if (message.id === 1) {
                updateLifecycle(message.success
                    ? { state: "connected", subscription: "active" }
                    : {
                        state: "failed",
                        reason: message.message ?? "Home Assistant event subscription failed.",
                    });
                return;
            }
            if (pendingEntityStateRequests.has(message.id)) {
                pendingEntityStateRequests.delete(message.id);
                const entities = message.success ? mapHomeAssistantStateResult(message.result) : [];
                for (const entity of entities) {
                    await transport.publish(entity);
                }
                const result = {
                    requestId: message.id,
                    entities,
                    success: message.success,
                    ...(message.message ? { reason: message.message } : {}),
                };
                for (const listener of entityStateListListeners) {
                    listener(result);
                }
                return;
            }
            if (pendingLovelaceResourceRequests.has(message.id)) {
                const command = pendingLovelaceResourceRequests.get(message.id);
                pendingLovelaceResourceRequests.delete(message.id);
                const resources = message.success ? mapHomeAssistantLovelaceResources(message.result) : [];
                const result = {
                    requestId: message.id,
                    ...(command ? { command } : {}),
                    resources,
                    success: message.success,
                    ...(message.message ? { reason: message.message } : {}),
                };
                for (const listener of lovelaceResourceListeners) {
                    listener(result);
                }
                return;
            }
            const command = pendingServiceCommands.get(message.id);
            if (!command) {
                return;
            }
            pendingServiceCommands.delete(message.id);
            const result = {
                requestId: message.id,
                command,
                success: message.success,
                ...(message.message ? { reason: message.message } : {}),
            };
            for (const listener of serviceResultListeners) {
                listener(result);
            }
            return;
        }
        await transport.publish(mapHomeAssistantStateChangedEvent(message));
    });
    const removeCloseListener = socket.onClose(reason => {
        updateLifecycle({ state: "closed", ...(reason ? { reason } : {}) });
    });
    return {
        transport,
        getLifecycle() {
            return lifecycle;
        },
        subscribeLifecycle(listener) {
            lifecycleListeners.add(listener);
            listener(lifecycle);
            return () => lifecycleListeners.delete(listener);
        },
        requestEntityStates() {
            if (lifecycle.state !== "connected") {
                return {
                    accepted: false,
                    reason: "Home Assistant is not connected.",
                };
            }
            const requestId = nextRequestId;
            nextRequestId += 1;
            pendingEntityStateRequests.add(requestId);
            socket.send(JSON.stringify({ id: requestId, type: "get_states" }));
            return { accepted: true, requestId };
        },
        subscribeEntityStateList(listener) {
            entityStateListListeners.add(listener);
            return () => entityStateListListeners.delete(listener);
        },
        requestLovelaceResources(command = "lovelace/resources") {
            if (lifecycle.state !== "connected") {
                return {
                    accepted: false,
                    reason: "Home Assistant is not connected.",
                };
            }
            const requestId = nextRequestId;
            nextRequestId += 1;
            pendingLovelaceResourceRequests.set(requestId, command);
            socket.send(JSON.stringify({ id: requestId, type: command }));
            return { accepted: true, requestId, command };
        },
        subscribeLovelaceResources(listener) {
            lovelaceResourceListeners.add(listener);
            return () => lovelaceResourceListeners.delete(listener);
        },
        callService(command) {
            if (lifecycle.state !== "connected" || lifecycle.subscription !== "active") {
                return {
                    accepted: false,
                    reason: "Home Assistant event subscription is not active.",
                };
            }
            const validatedCommand = createHomeAssistantServiceCommand(command.entityId, command.service);
            if (!validatedCommand || validatedCommand.domain !== command.domain) {
                return {
                    accepted: false,
                    reason: "Only light and switch turn_on or turn_off commands are allowed.",
                };
            }
            const requestId = nextRequestId;
            nextRequestId += 1;
            socket.send(JSON.stringify({
                id: requestId,
                type: "call_service",
                domain: validatedCommand.domain,
                service: validatedCommand.service,
                target: { entity_id: validatedCommand.entityId },
                ...(validatedCommand.brightnessPercent ? { service_data: { brightness_pct: validatedCommand.brightnessPercent } } : {}),
            }));
            pendingServiceCommands.set(requestId, validatedCommand);
            return { accepted: true, requestId };
        },
        subscribeServiceResult(listener) {
            serviceResultListeners.add(listener);
            return () => serviceResultListeners.delete(listener);
        },
        disconnect() {
            removeMessageListener();
            removeCloseListener();
            socket.close();
            updateLifecycle({ state: "closed" });
        },
    };
}
function mapHomeAssistantLovelaceResources(result) {
    if (!Array.isArray(result)) {
        return [];
    }
    return result
        .map(resource => {
        if (!isRecord(resource) || typeof resource.url !== "string" || !resource.url.trim()) {
            return undefined;
        }
        return { url: resource.url.trim() };
    })
        .filter((resource) => resource !== undefined);
}
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
