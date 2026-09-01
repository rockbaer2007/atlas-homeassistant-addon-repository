/**
 * ATLAS Framework
 *
 * Event Infrastructure
 * Sprint: G2.5.1b-R2 "Heartbeat"
 *
 * Stores event handlers grouped by event type.
 */
export class EventHandlerCollection {
    map = new Map();
    /**
     * Registers an event handler.
     *
     * @param eventType Event type.
     * @param handler Event handler.
     */
    add(eventType, handler) {
        let handlers = this.map.get(eventType);
        if (!handlers) {
            handlers = new Set();
            this.map.set(eventType, handlers);
        }
        handlers.add(handler);
    }
    /**
     * Removes a registered handler.
     *
     * @param eventType Event type.
     * @param handler Event handler.
     *
     * @returns True if the handler was removed.
     */
    remove(eventType, handler) {
        const handlers = this.map.get(eventType);
        if (!handlers) {
            return false;
        }
        const removed = handlers.delete(handler);
        if (handlers.size === 0) {
            this.map.delete(eventType);
        }
        return removed;
    }
    /**
     * Returns a snapshot of all handlers registered
     * for the specified event type.
     *
     * The returned array is immutable and safe to
     * iterate while subscriptions are modified.
     *
     * @param eventType Event type.
     */
    getHandlers(eventType) {
        return [...(this.map.get(eventType) ?? [])];
    }
    /**
     * Removes all registered handlers.
     */
    clear() {
        this.map.clear();
    }
    /**
     * Gets the total number of registered handlers.
     */
    get handlerCount() {
        let count = 0;
        for (const handlers of this.map.values()) {
            count += handlers.size;
        }
        return count;
    }
    /**
     * Gets the number of registered event types.
     */
    get eventTypeCount() {
        return this.map.size;
    }
}
