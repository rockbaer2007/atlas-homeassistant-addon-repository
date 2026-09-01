/**
 * ATLAS Framework
 *
 * Event Infrastructure
 * Sprint: G2.5.1b-R2 "Heartbeat"
 *
 * Default implementation of the ATLAS EventBus.
 */
import type { Event } from "../contracts/Event";
import type { EventBus } from "../contracts/EventBus";
import type { EventHandler } from "../contracts/EventHandler";
import type { EventSubscription } from "../contracts/EventSubscription";
export declare class DefaultEventBus implements EventBus {
    private readonly collection;
    private subscriptionCounter;
    /**
     * Registers an event handler.
     *
     * @param eventType Event type.
     * @param handler Event handler.
     *
     * @returns Event subscription.
     */
    subscribe<T extends Event>(eventType: string, handler: EventHandler<T>): EventSubscription;
    /**
     * Publishes an event.
     *
     * Handlers are executed sequentially in registration order.
     *
     * If one handler throws an exception,
     * publishing stops immediately.
     */
    publish<T extends Event>(event: T): Promise<void>;
    /**
     * Removes all registered handlers.
     */
    clear(): void;
}
