import { type HomeAssistantEntityState } from "./HomeAssistantEntityState";
export type HomeAssistantWebSocketLifecycleState = "connecting" | "authenticating" | "connected" | "failed" | "closed";
export type HomeAssistantWebSocketLifecycle = Readonly<{
    state: HomeAssistantWebSocketLifecycleState;
    subscription?: "pending" | "active";
    reason?: string;
}>;
export type HomeAssistantWebSocketProtocolMessage = Readonly<{
    type: "auth_required";
}> | Readonly<{
    type: "auth_ok";
}> | Readonly<{
    type: "auth_invalid";
    message: string;
}> | Readonly<{
    type: "result";
    id: number;
    success: boolean;
    message?: string;
    result?: unknown;
}> | Readonly<{
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
export declare function parseHomeAssistantWebSocketMessage(rawData: string): HomeAssistantWebSocketProtocolMessage | undefined;
export declare function mapHomeAssistantStateResult(result: unknown): readonly HomeAssistantEntityState[];
export declare function mapHomeAssistantStateChangedEvent(message: Extract<HomeAssistantWebSocketProtocolMessage, {
    type: "event";
}>): HomeAssistantEntityState;
