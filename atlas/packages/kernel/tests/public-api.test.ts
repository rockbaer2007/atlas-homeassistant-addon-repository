import { describe, expect, it, vi } from "vitest";

import {
  DefaultEventBus,
  type Event,
  type EventBus,
  type EventPublisher,
  type EventSubscriber,
} from "../src";

describe("@atlas/kernel public API", () => {
  it("exposes the default EventBus through the package root", async () => {
    const bus: EventBus = new DefaultEventBus();
    const handler = vi.fn();

    bus.subscribe("demo", handler);

    const event: Event = {
      type: "demo",
      timestamp: new Date(),
    };

    await bus.publish(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it("exposes publisher and subscriber views without duplicating the event contract", async () => {
    const bus = new DefaultEventBus();
    const publisher: EventPublisher = bus;
    const subscriber: EventSubscriber = bus;
    const handler = vi.fn();
    const subscription = subscriber.subscribe("demo", handler);
    const event: Event = { type: "demo", timestamp: new Date() };

    await publisher.publish(event);

    expect(handler).toHaveBeenCalledWith(event);
    await subscription.dispose();
  });
});
