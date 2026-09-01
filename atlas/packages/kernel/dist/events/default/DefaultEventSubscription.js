/**
 * ATLAS Framework
 *
 * Event Infrastructure
 * Sprint: G2.5.1b-R2 "Heartbeat"
 *
 * Default implementation of an event subscription.
 */
export class DefaultEventSubscription {
    id;
    eventType;
    disposeAction;
    isDisposedInternal = false;
    /**
     * Creates a new event subscription.
     *
     * @param id Unique subscription identifier.
     * @param eventType Registered event type.
     * @param disposeAction Callback executed when the subscription is disposed.
     */
    constructor(id, eventType, disposeAction) {
        this.id = id;
        this.eventType = eventType;
        this.disposeAction = disposeAction;
    }
    /**
     * Disposes this subscription.
     *
     * Calling dispose() multiple times is safe.
     */
    async dispose() {
        if (this.isDisposedInternal) {
            return;
        }
        this.isDisposedInternal = true;
        await this.disposeAction();
    }
}
