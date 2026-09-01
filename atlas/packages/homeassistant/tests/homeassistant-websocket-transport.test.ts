import { describe, expect, it } from "vitest";

import {
  createHomeAssistantWebSocketClient,
  createHomeAssistantServiceCommand,
  createHomeAssistantBrightnessCommand,
  mapHomeAssistantStateResult,
  mapHomeAssistantStateChangedEvent,
  parseHomeAssistantWebSocketMessage,
  type HomeAssistantWebSocket,
} from "../src";

function createTestSocket(): HomeAssistantWebSocket & {
  readonly sent: string[];
  readonly emitMessage: (data: string) => Promise<void>;
  readonly emitClose: (reason?: string) => void;
  readonly closed: () => boolean;
} {
  const messageListeners = new Set<(data: string) => void | Promise<void>>();
  const closeListeners = new Set<(reason?: string) => void>();
  const sent: string[] = [];
  let isClosed = false;

  return {
    sent,
    send(data: string): void {
      sent.push(data);
    },
    close(): void {
      isClosed = true;
    },
    onMessage(listener): () => void {
      messageListeners.add(listener);
      return () => messageListeners.delete(listener);
    },
    onClose(listener): () => void {
      closeListeners.add(listener);
      return () => closeListeners.delete(listener);
    },
    async emitMessage(data: string): Promise<void> {
      for (const listener of messageListeners) {
        await listener(data);
      }
    },
    emitClose(reason?: string): void {
      for (const listener of closeListeners) {
        listener(reason);
      }
    },
    closed: (): boolean => isClosed,
  };
}

describe("Home Assistant WebSocket transport", () => {
  it("parses authentication and state change protocol messages safely", () => {
    expect(parseHomeAssistantWebSocketMessage('{"type":"auth_required"}')).toEqual({
      type: "auth_required",
    });
    expect(parseHomeAssistantWebSocketMessage("not-json")).toBeUndefined();
    expect(parseHomeAssistantWebSocketMessage(JSON.stringify({
      id: 7,
      type: "result",
      success: true,
      result: [{
        entity_id: "sensor.atlas_power",
        state: "120",
        attributes: { friendly_name: "ATLAS power", unit_of_measurement: "W" },
      }],
    }))).toEqual({
      id: 7,
      type: "result",
      success: true,
      result: [{
        entity_id: "sensor.atlas_power",
        state: "120",
        attributes: { friendly_name: "ATLAS power", unit_of_measurement: "W" },
      }],
    });

    const event = parseHomeAssistantWebSocketMessage(JSON.stringify({
      type: "event",
      event: {
        event_type: "state_changed",
        data: {
          entity_id: "binary_sensor.atlas",
          new_state: { state: "on" },
        },
      },
    }));

    expect(event).toMatchObject({ type: "event" });
    expect(mapHomeAssistantStateChangedEvent(event as Extract<typeof event, { type: "event" }>)).toEqual({
      entityId: "binary_sensor.atlas",
      state: "on",
      value: "on",
    });

    const sensorEvent = parseHomeAssistantWebSocketMessage(JSON.stringify({
      type: "event",
      event: {
        event_type: "state_changed",
        data: {
          entity_id: "sensor.atlas_temperature",
          new_state: {
            state: "21.5",
            attributes: {
              friendly_name: "Office temperature",
              unit_of_measurement: "°C",
            },
          },
        },
      },
    }));
    expect(mapHomeAssistantStateChangedEvent(sensorEvent as Extract<typeof sensorEvent, { type: "event" }>)).toEqual({
      entityId: "sensor.atlas_temperature",
      state: "available",
      value: "21.5",
      name: "Office temperature",
      unit: "°C",
    });
    expect(mapHomeAssistantStateResult([{
      entity_id: "sensor.atlas_power",
      state: "120",
      attributes: { friendly_name: "ATLAS power", unit_of_measurement: "W" },
    }])).toEqual([{
      entityId: "sensor.atlas_power",
      state: "available",
      value: "120",
      name: "ATLAS power",
      unit: "W",
    }]);
  });

  it("authenticates, subscribes and publishes state events through the local transport", async () => {
    const socket = createTestSocket();
    const client = createHomeAssistantWebSocketClient(socket, "test-token");
    const lifecycleStates: string[] = [];
    client.subscribeLifecycle(lifecycle => lifecycleStates.push(lifecycle.state));

    expect(client.getLifecycle()).toEqual({ state: "connecting" });
    await socket.emitMessage('{"type":"auth_required"}');
    expect(client.getLifecycle()).toEqual({ state: "authenticating" });
    expect(socket.sent).toEqual(['{"type":"auth","access_token":"test-token"}']);

    await socket.emitMessage('{"type":"auth_ok"}');
    expect(client.getLifecycle()).toEqual({ state: "connected", subscription: "pending" });
    expect(socket.sent[1]).toBe('{"id":1,"type":"subscribe_events","event_type":"state_changed"}');

    await socket.emitMessage('{"id":1,"type":"result","success":true,"result":null}');
    expect(client.getLifecycle()).toEqual({ state: "connected", subscription: "active" });

    await socket.emitMessage(JSON.stringify({
      type: "event",
      event: {
        event_type: "state_changed",
        data: {
          entity_id: "binary_sensor.atlas",
          new_state: { state: "off" },
        },
      },
    }));

    expect(client.transport.getLatest("binary_sensor.atlas")).toEqual({
      entityId: "binary_sensor.atlas",
      state: "off",
      value: "off",
    });
    expect(lifecycleStates).toEqual(["connecting", "authenticating", "connected", "connected"]);
  });

  it("reports authentication failures and closes cleanly", async () => {
    const socket = createTestSocket();
    const client = createHomeAssistantWebSocketClient(socket, "test-token");

    await socket.emitMessage('{"type":"auth_invalid","message":"invalid token"}');
    expect(client.getLifecycle()).toEqual({ state: "failed", reason: "invalid token" });

    client.disconnect();
    expect(socket.closed()).toBe(true);
    expect(client.getLifecycle()).toEqual({ state: "closed" });
  });

  it("reports rejected event subscriptions and remote close reasons", async () => {
    const socket = createTestSocket();
    const client = createHomeAssistantWebSocketClient(socket, "test-token");

    await socket.emitMessage('{"id":1,"type":"result","success":false,"error":{"message":"not authorized"}}');
    expect(client.getLifecycle()).toEqual({ state: "failed", reason: "not authorized" });

    socket.emitClose("server restart");
    expect(client.getLifecycle()).toEqual({ state: "closed", reason: "server restart" });
  });

  it("sends only validated light and switch commands after subscription is active", async () => {
    const socket = createTestSocket();
    const client = createHomeAssistantWebSocketClient(socket, "test-token");
    const lightCommand = createHomeAssistantServiceCommand("light.atlas_lamp", "turn_on");

    expect(lightCommand).toBeDefined();
    expect(client.callService(lightCommand!)).toEqual({
      accepted: false,
      reason: "Home Assistant event subscription is not active.",
    });

    await socket.emitMessage('{"type":"auth_ok"}');
    await socket.emitMessage('{"id":1,"type":"result","success":true}');
    const serviceResults: Array<{ success: boolean; reason?: string }> = [];
    client.subscribeServiceResult(result => serviceResults.push(result));
    expect(client.callService(lightCommand!)).toEqual({ accepted: true, requestId: 2 });
    expect(socket.sent[1]).toBe('{"id":2,"type":"call_service","domain":"light","service":"turn_on","target":{"entity_id":"light.atlas_lamp"}}');
    await socket.emitMessage('{"id":2,"type":"result","success":false,"error":{"message":"device unavailable"}}');
    expect(serviceResults).toMatchObject([{
      requestId: 2,
      command: lightCommand,
      success: false,
      reason: "device unavailable",
    }]);
    expect(createHomeAssistantServiceCommand("sensor.atlas_temperature", "turn_on")).toBeUndefined();
    expect(createHomeAssistantBrightnessCommand("light.atlas_lamp", 55)).toEqual({
      entityId: "light.atlas_lamp",
      domain: "light",
      service: "turn_on",
      brightnessPercent: 55,
    });
    expect(createHomeAssistantBrightnessCommand("switch.atlas_switch", 55)).toBeUndefined();
  });

  it("requests the Home Assistant entity state list after authentication succeeds", async () => {
    const socket = createTestSocket();
    const client = createHomeAssistantWebSocketClient(socket, "test-token");

    expect(client.requestEntityStates()).toEqual({
      accepted: false,
      reason: "Home Assistant is not connected.",
    });

    await socket.emitMessage('{"type":"auth_ok"}');
    const results: Array<{ success: boolean; entities: readonly { entityId: string }[] }> = [];
    client.subscribeEntityStateList(result => results.push(result));

    expect(client.requestEntityStates()).toEqual({ accepted: true, requestId: 2 });
    expect(socket.sent[1]).toBe('{"id":2,"type":"get_states"}');

    await socket.emitMessage(JSON.stringify({
      id: 2,
      type: "result",
      success: true,
      result: [{
        entity_id: "light.atlas_lamp",
        state: "on",
        attributes: { friendly_name: "ATLAS lamp" },
      }],
    }));

    expect(results).toEqual([{
      requestId: 2,
      success: true,
      entities: [{
        entityId: "light.atlas_lamp",
        state: "on",
        value: "on",
        name: "ATLAS lamp",
      }],
    }]);
    expect(client.transport.getLatest("light.atlas_lamp")).toEqual({
      entityId: "light.atlas_lamp",
      state: "on",
      value: "on",
      name: "ATLAS lamp",
    });
  });

  it("keeps entity state requests when the socket answers during send", async () => {
    const messageListeners = new Set<(data: string) => void | Promise<void>>();
    const socket: HomeAssistantWebSocket & { readonly sent: string[] } = {
      sent: [],
      send(data: string): void {
        this.sent.push(data);
        const message = JSON.parse(data) as { id?: number; type?: string };
        if (message.type !== "get_states" || typeof message.id !== "number") {
          return;
        }
        for (const listener of messageListeners) {
          void listener(JSON.stringify({
            id: message.id,
            type: "result",
            success: true,
            result: [{
              entity_id: "sensor.instant_state",
              state: "42",
              attributes: { friendly_name: "Instant state" },
            }],
          }));
        }
      },
      close(): void {},
      onMessage(listener): () => void {
        messageListeners.add(listener);
        return () => messageListeners.delete(listener);
      },
      onClose(): () => void {
        return () => {};
      },
    };
    const client = createHomeAssistantWebSocketClient(socket, "test-token");
    const results: Array<{ entities: readonly { entityId: string }[] }> = [];
    client.subscribeEntityStateList(result => results.push(result));

    for (const listener of messageListeners) {
      await listener('{"type":"auth_ok"}');
    }
    expect(client.requestEntityStates()).toEqual({ accepted: true, requestId: 2 });

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(results).toEqual([{
      requestId: 2,
      success: true,
      entities: [{
        entityId: "sensor.instant_state",
        state: "available",
        value: "42",
        name: "Instant state",
      }],
    }]);
  });

  it("sends the event subscription before lifecycle listeners can request other data", async () => {
    const socket = createTestSocket();
    const client = createHomeAssistantWebSocketClient(socket, "test-token");

    client.subscribeLifecycle(lifecycle => {
      if (lifecycle.state === "connected") {
        client.requestEntityStates();
        client.requestLovelaceResources();
      }
    });

    await socket.emitMessage('{"type":"auth_ok"}');

    expect(socket.sent).toEqual([
      '{"id":1,"type":"subscribe_events","event_type":"state_changed"}',
      '{"id":2,"type":"get_states"}',
      '{"id":3,"type":"lovelace/resources"}',
    ]);
  });

  it("requests Lovelace resources after authentication succeeds", async () => {
    const socket = createTestSocket();
    const client = createHomeAssistantWebSocketClient(socket, "test-token");

    expect(client.requestLovelaceResources()).toEqual({
      accepted: false,
      reason: "Home Assistant is not connected.",
    });

    await socket.emitMessage('{"type":"auth_ok"}');
    const results: Array<{ success: boolean; resources: readonly { url: string }[] }> = [];
    client.subscribeLovelaceResources(result => results.push(result));

    expect(client.requestLovelaceResources()).toEqual({
      accepted: true,
      requestId: 2,
      command: "lovelace/resources",
    });
    expect(socket.sent[1]).toBe('{"id":2,"type":"lovelace/resources"}');

    await socket.emitMessage(JSON.stringify({
      id: 2,
      type: "result",
      success: true,
      result: [
        { url: "/hacsfiles/Bubble-Card/bubble-card.js?ver=2" },
        { url: " " },
        { type: "module" },
      ],
    }));

    expect(results).toEqual([{
      requestId: 2,
      command: "lovelace/resources",
      success: true,
      resources: [
        { url: "/hacsfiles/Bubble-Card/bubble-card.js?ver=2" },
      ],
    }]);
  });

  it("can request Lovelace resources with the list command alias", async () => {
    const socket = createTestSocket();
    const client = createHomeAssistantWebSocketClient(socket, "test-token");

    await socket.emitMessage('{"type":"auth_ok"}');
    const results: Array<{ requestId: number; command?: string; success: boolean; resources: readonly { url: string }[] }> = [];
    client.subscribeLovelaceResources(result => results.push(result));

    expect(client.requestLovelaceResources("lovelace/resources/list")).toEqual({
      accepted: true,
      requestId: 2,
      command: "lovelace/resources/list",
    });
    expect(socket.sent[1]).toBe('{"id":2,"type":"lovelace/resources/list"}');

    await socket.emitMessage(JSON.stringify({
      id: 2,
      type: "result",
      success: true,
      result: [
        { url: "/hacsfiles/lovelace-mushroom/mushroom.js" },
      ],
    }));

    expect(results).toEqual([{
      requestId: 2,
      command: "lovelace/resources/list",
      success: true,
      resources: [
        { url: "/hacsfiles/lovelace-mushroom/mushroom.js" },
      ],
    }]);
  });
});
