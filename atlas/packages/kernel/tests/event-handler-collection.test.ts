import { describe, expect, it, vi } from "vitest";

import { EventHandlerCollection } from "../src/events/default/EventHandlerCollection";

describe("EventHandlerCollection", () => {

  it("adds a handler", () => {

    const collection = new EventHandlerCollection();

    const handler = vi.fn();

    collection.add("demo", handler);

    expect(collection.handlerCount).toBe(1);
    expect(collection.eventTypeCount).toBe(1);

  });

  it("does not register duplicate handlers", () => {

    const collection = new EventHandlerCollection();

    const handler = vi.fn();

    collection.add("demo", handler);
    collection.add("demo", handler);

    expect(collection.handlerCount).toBe(1);

  });

  it("removes a handler", () => {

    const collection = new EventHandlerCollection();

    const handler = vi.fn();

    collection.add("demo", handler);

    expect(collection.remove("demo", handler)).toBe(true);

    expect(collection.handlerCount).toBe(0);
    expect(collection.eventTypeCount).toBe(0);

  });

  it("returns false when removing an unknown handler", () => {

    const collection = new EventHandlerCollection();

    expect(
      collection.remove("demo", vi.fn()),
    ).toBe(false);

  });

  it("returns a snapshot", () => {

    const collection = new EventHandlerCollection();

    const handler = vi.fn();

    collection.add("demo", handler);

    const snapshot = collection.getHandlers("demo");

    collection.remove("demo", handler);

    expect(snapshot).toHaveLength(1);

  });

  it("clears the collection", () => {

    const collection = new EventHandlerCollection();

    collection.add("a", vi.fn());
    collection.add("b", vi.fn());

    collection.clear();

    expect(collection.handlerCount).toBe(0);
    expect(collection.eventTypeCount).toBe(0);

  });

});
