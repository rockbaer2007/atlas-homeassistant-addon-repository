import {
  createHomeAssistantEntityState,
  type HomeAssistantEntityState,
} from "./HomeAssistantEntityState";

export type HomeAssistantWebSocketLifecycleState =
  | "connecting"
  | "authenticating"
  | "connected"
  | "failed"
  | "closed";

export type HomeAssistantWebSocketLifecycle = Readonly<{
  state: HomeAssistantWebSocketLifecycleState;
  subscription?: "pending" | "active";
  reason?: string;
}>;

export type HomeAssistantWebSocketProtocolMessage =
  | Readonly<{ type: "auth_required" }>
  | Readonly<{ type: "auth_ok" }>
  | Readonly<{ type: "auth_invalid"; message: string }>
  | Readonly<{
    type: "result";
    id: number;
    success: boolean;
    message?: string;
    result?: unknown;
  }>
  | Readonly<{
    type: "event";
    event: Readonly<{
      event_type: "state_changed";
      data: Readonly<{
        entity_id: string;
        new_state: Readonly<{
          state: string;
          attributes?: Readonly<{
            friendly_name?: string;
            unit_of_measurement?: string;
          }>;
        }> | null;
      }>;
    }>;
  }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseHomeAssistantWebSocketMessage(
  rawData: string,
): HomeAssistantWebSocketProtocolMessage | undefined {
  try {
    const message: unknown = JSON.parse(rawData);

    if (!isRecord(message) || typeof message.type !== "string") {
      return undefined;
    }

    if (message.type === "auth_required" || message.type === "auth_ok") {
      return { type: message.type };
    }

    if (message.type === "auth_invalid" && typeof message.message === "string") {
      return { type: "auth_invalid", message: message.message };
    }

    if (message.type === "result" && typeof message.id === "number" && typeof message.success === "boolean") {
      const error = isRecord(message.error) ? message.error : undefined;
      const errorMessage = error && typeof error.message === "string" ? error.message : undefined;

      return {
        type: "result",
        id: message.id,
        success: message.success,
        ...(errorMessage ? { message: errorMessage } : {}),
        ...("result" in message ? { result: message.result } : {}),
      };
    }

    if (message.type !== "event" || !isRecord(message.event)) {
      return undefined;
    }

    const event = message.event;
    if (event.event_type !== "state_changed" || !isRecord(event.data)) {
      return undefined;
    }

    const eventData = event.data;
    const newState = eventData.new_state;
    if (typeof eventData.entity_id !== "string") {
      return undefined;
    }

    let newStateValue: string | null;
    let attributes: Readonly<{ friendly_name?: string; unit_of_measurement?: string }> | undefined;
    if (newState === null) {
      newStateValue = null;
    } else {
      if (!isRecord(newState) || typeof newState.state !== "string") {
        return undefined;
      }

      newStateValue = newState.state;
      if (isRecord(newState.attributes)) {
        attributes = {
          ...(typeof newState.attributes.friendly_name === "string"
            ? { friendly_name: newState.attributes.friendly_name }
            : {}),
          ...(typeof newState.attributes.unit_of_measurement === "string"
            ? { unit_of_measurement: newState.attributes.unit_of_measurement }
            : {}),
        };
      }
    }

    return {
      type: "event",
      event: {
        event_type: "state_changed",
        data: {
          entity_id: eventData.entity_id,
          new_state: newStateValue === null
            ? null
            : { state: newStateValue, ...(attributes ? { attributes } : {}) },
        },
      },
    };
  } catch {
    return undefined;
  }
}

export function mapHomeAssistantStateResult(
  result: unknown,
): readonly HomeAssistantEntityState[] {
  if (!Array.isArray(result)) {
    return [];
  }

  return result
    .map(entity => {
      if (!isRecord(entity) || typeof entity.entity_id !== "string" || typeof entity.state !== "string") {
        return undefined;
      }
      const attributes = isRecord(entity.attributes) ? entity.attributes : undefined;
      return createHomeAssistantEntityState({
        entityId: entity.entity_id,
        state: entity.state === "on" || entity.state === "off" || entity.state === "unavailable" || entity.state === "unknown"
          ? entity.state
          : "available",
        value: entity.state,
        ...(typeof attributes?.friendly_name === "string" ? { name: attributes.friendly_name } : {}),
        ...(typeof attributes?.unit_of_measurement === "string" ? { unit: attributes.unit_of_measurement } : {}),
      });
    })
    .filter((entity): entity is HomeAssistantEntityState => entity !== undefined);
}

export function mapHomeAssistantStateChangedEvent(
  message: Extract<HomeAssistantWebSocketProtocolMessage, { type: "event" }>,
): HomeAssistantEntityState {
  const state = message.event.data.new_state?.state;
  const attributes = message.event.data.new_state?.attributes;

  return createHomeAssistantEntityState({
    entityId: message.event.data.entity_id,
    state: state === "on" || state === "off" || state === "unavailable" || state === "unknown"
      ? state
      : state
        ? "available"
        : "unknown",
    ...(state ? { value: state } : {}),
    ...(attributes?.friendly_name ? { name: attributes.friendly_name } : {}),
    ...(attributes?.unit_of_measurement ? { unit: attributes.unit_of_measurement } : {}),
  });
}
