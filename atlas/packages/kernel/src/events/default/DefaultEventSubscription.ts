/**
 * ATLAS Framework
 *
 * Event Infrastructure
 * Sprint: G2.5.1b-R2 "Heartbeat"
 *
 * Default implementation of an event subscription.
 */

import type { EventSubscription } from "../contracts/EventSubscription";

export class DefaultEventSubscription implements EventSubscription {

  private isDisposedInternal = false;

  /**
   * Creates a new event subscription.
   *
   * @param id Unique subscription identifier.
   * @param eventType Registered event type.
   * @param disposeAction Callback executed when the subscription is disposed.
   */
  public constructor(
    public readonly id: string,
    public readonly eventType: string,
    private readonly disposeAction: () => void | Promise<void>,
  ) {}

  /**
   * Disposes this subscription.
   *
   * Calling dispose() multiple times is safe.
   */
  public async dispose(): Promise<void> {

    if (this.isDisposedInternal) {
      return;
    }

    this.isDisposedInternal = true;

    await this.disposeAction();
  }

}
