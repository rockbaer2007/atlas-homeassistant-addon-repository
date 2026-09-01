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

export class EventHandlerCollection {

  private readonly map = new Map<
    string,
    Set<InternalEventHandler>
  >();

  /**
   * Registers an event handler.
   *
   * @param eventType Event type.
   * @param handler Event handler.
   */
  public add(
    eventType: string,
    handler: InternalEventHandler,
  ): void {

    let handlers = this.map.get(eventType);

    if (!handlers) {
      handlers = new Set<InternalEventHandler>();
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
  public remove(
    eventType: string,
    handler: InternalEventHandler,
  ): boolean {

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
  public getHandlers(
    eventType: string,
  ): readonly InternalEventHandler[] {

    return [...(this.map.get(eventType) ?? [])];
  }

  /**
   * Removes all registered handlers.
   */
  public clear(): void {
    this.map.clear();
  }

  /**
   * Gets the total number of registered handlers.
   */
  public get handlerCount(): number {

    let count = 0;

    for (const handlers of this.map.values()) {
      count += handlers.size;
    }

    return count;
  }

  /**
   * Gets the number of registered event types.
   */
  public get eventTypeCount(): number {
    return this.map.size;
  }

}
