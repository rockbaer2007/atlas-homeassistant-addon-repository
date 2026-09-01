/**
 * ATLAS Framework
 *
 * Event Infrastructure
 * Sprint: G2.5.1b-R2 "Heartbeat"
 *
 * Default implementation of an event subscription.
 */
import type { EventSubscription } from "../contracts/EventSubscription";
export declare class DefaultEventSubscription implements EventSubscription {
    readonly id: string;
    readonly eventType: string;
    private readonly disposeAction;
    private isDisposedInternal;
    /**
     * Creates a new event subscription.
     *
     * @param id Unique subscription identifier.
     * @param eventType Registered event type.
     * @param disposeAction Callback executed when the subscription is disposed.
     */
    constructor(id: string, eventType: string, disposeAction: () => void | Promise<void>);
    /**
     * Disposes this subscription.
     *
     * Calling dispose() multiple times is safe.
     */
    dispose(): Promise<void>;
}
