import { describe, expect, it, vi } from "vitest";

import type { Event } from "../src/events/contracts/Event";
import { DefaultEventBus } from "../src/events/default/DefaultEventBus";

function createEvent(type = "demo"): Event {
  return {
    type,
    timestamp: new Date(),
  };
}

describe("DefaultEventBus", () => {

  it("registers an event handler", async () => {

    const bus = new DefaultEventBus();

    const handler = vi.fn();

    bus.subscribe("demo", handler);

    await bus.publish(createEvent());

    expect(handler).toHaveBeenCalledOnce();

  });

  it("publishes to multiple handlers", async () => {

    const bus = new DefaultEventBus();

    const first = vi.fn();
    const second = vi.fn();

    bus.subscribe("demo", first);
    bus.subscribe("demo", second);

    await bus.publish(createEvent());

    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();

  });

  it("executes handlers in registration order", async () => {

    const bus = new DefaultEventBus();

    const order: string[] = [];

    bus.subscribe("demo", () => {
      order.push("A");
    });

    bus.subscribe("demo", () => {
      order.push("B");
    });

    await bus.publish(createEvent());

    expect(order).toEqual([
      "A",
      "B",
    ]);

  });

  it("removes a subscription", async () => {

    const bus = new DefaultEventBus();

    const handler = vi.fn();

    const subscription = bus.subscribe(
      "demo",
      handler,
    );

    await subscription.dispose();

    await bus.publish(createEvent());

    expect(handler).not.toHaveBeenCalled();

  });

  it("supports multiple dispose calls", async () => {

    const bus = new DefaultEventBus();

    const handler = vi.fn();

    const subscription = bus.subscribe(
      "demo",
      handler,
    );

    await subscription.dispose();
    await subscription.dispose();
    await subscription.dispose();

    await bus.publish(createEvent());

    expect(handler).not.toHaveBeenCalled();

  });

  it("clears all handlers", async () => {

    const bus = new DefaultEventBus();

    const handler = vi.fn();

    bus.subscribe("demo", handler);

    bus.clear();

    await bus.publish(createEvent());

    expect(handler).not.toHaveBeenCalled();

  });

  it("publishes without handlers", async () => {

    const bus = new DefaultEventBus();

    await expect(
      bus.publish(createEvent()),
    ).resolves.toBeUndefined();

  });

  it("stops publishing after a handler throws", async () => {

    const bus = new DefaultEventBus();

    const second = vi.fn();

    bus.subscribe("demo", () => {
      throw new Error("Boom");
    });

    bus.subscribe("demo", second);

    await expect(
      bus.publish(createEvent()),
    ).rejects.toThrow("Boom");

    expect(second).not.toHaveBeenCalled();

  });

  it("creates unique subscription ids", () => {

    const bus = new DefaultEventBus();

    const first = bus.subscribe(
      "demo",
      () => {},
    );

    const second = bus.subscribe(
      "demo",
      () => {},
    );

    expect(first.id).not.toBe(second.id);

  });

  it("supports async handlers", async () => {

    const bus = new DefaultEventBus();

    let executed = false;

    bus.subscribe(
      "demo",
      async () => {
        executed = true;
      },
    );

    await bus.publish(createEvent());

    expect(executed).toBe(true);

  });

  it("supports removing subscriptions during publish", async () => {

    const bus = new DefaultEventBus();

    let subscription!: { dispose(): Promise<void> };

    const second = vi.fn();

    subscription = bus.subscribe(
      "demo",
      async () => {
        await subscription.dispose();
      },
    );

    bus.subscribe("demo", second);

    await bus.publish(createEvent());

    expect(second).toHaveBeenCalledOnce();

  });

});
