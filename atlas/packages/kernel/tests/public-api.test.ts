import { describe, expect, it, vi } from "vitest";

import {
  DefaultEventBus,
  type Event,
  type EventBus,
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
});
