/**
 * ATLAS Framework
 *
 * Event Infrastructure
 * Sprint: G2.5.1b-R2 "Heartbeat"
 *
 * Stores event handlers grouped by event type.
 */
import type { Event } from "../contracts/Event";
import type { EventHandler } from "../contracts/EventHandler";
type InternalEventHandler = EventHandler<Event>;
export declare class EventHandlerCollection {
    private readonly map;
    /**
     * Registers an event handler.
     *
     * @param eventType Event type.
     * @param handler Event handler.
     */
    add(eventType: string, handler: InternalEventHandler): void;
    /**
     * Removes a registered handler.
     *
     * @param eventType Event type.
     * @param handler Event handler.
     *
     * @returns True if the handler was removed.
     */
    remove(eventType: string, handler: InternalEventHandler): boolean;
    /**
     * Returns a snapshot of all handlers registered
     * for the specified event type.
     *
     * The returned array is immutable and safe to
     * iterate while subscriptions are modified.
     *
     * @param eventType Event type.
     */
    getHandlers(eventType: string): readonly InternalEventHandler[];
    /**
     * Removes all registered handlers.
     */
    clear(): void;
    /**
     * Gets the total number of registered handlers.
     */
    get handlerCount(): number;
    /**
     * Gets the number of registered event types.
     */
    get eventTypeCount(): number;
}
export {};
