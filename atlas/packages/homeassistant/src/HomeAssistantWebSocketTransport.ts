import type { HomeAssistantEntityStatePublisher } from "./HomeAssistantEntityStateTransport";
import { createInMemoryHomeAssistantEntityStateTransport } from "./HomeAssistantEntityStateTransport";
import {
  mapHomeAssistantStateResult,
  mapHomeAssistantStateChangedEvent,
  parseHomeAssistantWebSocketMessage,
  type HomeAssistantWebSocketLifecycle,
} from "./HomeAssistantWebSocketProtocol";
import type { HomeAssistantEntityState } from "./HomeAssistantEntityState";
import type { HomeAssistantLovelaceResource } from "./HomeAssistantCardConfiguration";
import {
  createHomeAssistantServiceCommand,
  type HomeAssistantServiceCommand,
} from "./HomeAssistantServiceCommand";

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

export type HomeAssistantLovelaceResourceCommand =
  | "lovelace/resources"
  | "lovelace/resources/list";

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

export function createHomeAssistantWebSocketClient(
  socket: HomeAssistantWebSocket,
  accessToken: string,
): HomeAssistantWebSocketClient {
  const transport = createInMemoryHomeAssistantEntityStateTransport();
  let lifecycle: HomeAssistantWebSocketLifecycle = { state: "connecting" };
  let nextRequestId = 2;
  const lifecycleListeners = new Set<(lifecycle: HomeAssistantWebSocketLifecycle) => void>();
  const serviceResultListeners = new Set<(result: HomeAssistantServiceResult) => void>();
  const entityStateListListeners = new Set<(result: HomeAssistantEntityStateListResult) => void>();
  const lovelaceResourceListeners = new Set<(result: HomeAssistantLovelaceResourceListResult) => void>();
  const pendingServiceCommands = new Map<number, HomeAssistantServiceCommand>();
  const pendingEntityStateRequests = new Set<number>();
  const pendingLovelaceResourceRequests = new Map<number, HomeAssistantLovelaceResourceCommand>();
  const updateLifecycle = (nextLifecycle: HomeAssistantWebSocketLifecycle): void => {
    lifecycle = nextLifecycle;
    for (const listener of lifecycleListeners) {
      listener(lifecycle);
    }
  };
  const removeMessageListener = socket.onMessage(async data => {
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
        const result: HomeAssistantEntityStateListResult = {
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
        const result: HomeAssistantLovelaceResourceListResult = {
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
      const result: HomeAssistantServiceResult = {
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
    getLifecycle(): HomeAssistantWebSocketLifecycle {
      return lifecycle;
    },
    subscribeLifecycle(listener): () => void {
      lifecycleListeners.add(listener);
      listener(lifecycle);
      return () => lifecycleListeners.delete(listener);
    },
    requestEntityStates(): HomeAssistantEntityStateRequestResult {
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
    subscribeEntityStateList(listener): () => void {
      entityStateListListeners.add(listener);
      return () => entityStateListListeners.delete(listener);
    },
    requestLovelaceResources(command: HomeAssistantLovelaceResourceCommand = "lovelace/resources"): HomeAssistantLovelaceResourceRequestResult {
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
    subscribeLovelaceResources(listener): () => void {
      lovelaceResourceListeners.add(listener);
      return () => lovelaceResourceListeners.delete(listener);
    },
    callService(command): HomeAssistantServiceCallResult {
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
    subscribeServiceResult(listener): () => void {
      serviceResultListeners.add(listener);
      return () => serviceResultListeners.delete(listener);
    },
    disconnect(): void {
      removeMessageListener();
      removeCloseListener();
      socket.close();
      updateLifecycle({ state: "closed" });
    },
  };
}

function mapHomeAssistantLovelaceResources(result: unknown): readonly HomeAssistantLovelaceResource[] {
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
    .filter((resource): resource is HomeAssistantLovelaceResource => resource !== undefined);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
