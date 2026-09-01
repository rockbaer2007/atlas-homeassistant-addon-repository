/**
 * ATLAS Framework
 *
 * Event Infrastructure
 * Sprint: G2.5.1b-R2 "Heartbeat"
 *
 * Default implementation of the ATLAS EventBus.
 */
import { DefaultEventSubscription } from "./DefaultEventSubscription";
import { EventHandlerCollection } from "./EventHandlerCollection";
export class DefaultEventBus {
    collection = new EventHandlerCollection();
    subscriptionCounter = 0;
    /**
     * Registers an event handler.
     *
     * @param eventType Event type.
     * @param handler Event handler.
     *
     * @returns Event subscription.
     */
    subscribe(eventType, handler) {
        if (eventType.trim().length === 0) {
            throw new Error("Event type must not be empty.");
        }
        if (!handler) {
            throw new TypeError("Handler must not be null.");
        }
        const id = `sub-${++this.subscriptionCounter}`;
        // Internal storage uses the base Event type.
        // This is the single type boundary of the event infrastructure.
        this.collection.add(eventType, handler);
        return new DefaultEventSubscription(id, eventType, () => {
            this.collection.remove(eventType, handler);
        });
    }
    /**
     * Publishes an event.
     *
     * Handlers are executed sequentially in registration order.
     *
     * If one handler throws an exception,
     * publishing stops immediately.
     */
    async publish(event) {
        if (event.type.trim().length === 0) {
            throw new Error("Event type must not be empty.");
        }
        const handlers = this.collection.getHandlers(event.type);
        for (const handler of handlers) {
            await Promise.resolve(handler(event));
        }
    }
    /**
     * Removes all registered handlers.
     */
    clear() {
        this.collection.clear();
    }
}
