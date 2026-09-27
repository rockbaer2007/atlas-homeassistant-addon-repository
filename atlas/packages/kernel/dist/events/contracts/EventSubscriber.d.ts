import type { Event } from "./Event";
import type { EventHandler } from "./EventHandler";
import type { EventSubscription } from "./EventSubscription";
export interface EventSubscriber {
    subscribe<T extends Event>(eventType: string, handler: EventHandler<T>): EventSubscription;
    clear(): void;
}
