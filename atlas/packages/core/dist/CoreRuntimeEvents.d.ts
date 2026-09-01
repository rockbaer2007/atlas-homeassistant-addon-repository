import type { RuntimeEvent } from "@atlas/runtime";
import type { CoreRuntimeHost } from "./CoreRuntimeHost";
export type CoreRuntimeEvent = RuntimeEvent;
export type CoreRuntimeEventType = CoreRuntimeEvent["type"];
export type CoreRuntimeEventSubscription = ReturnType<CoreRuntimeHost["events"]["subscribe"]>;
export type CoreRuntimeEventHandler<TEvent extends CoreRuntimeEvent = CoreRuntimeEvent> = (event: TEvent) => void | Promise<void>;
export declare function subscribeToCoreRuntimeEvent<TEvent extends CoreRuntimeEvent = CoreRuntimeEvent>(host: CoreRuntimeHost, eventType: TEvent["type"], handler: CoreRuntimeEventHandler<TEvent>): CoreRuntimeEventSubscription;
