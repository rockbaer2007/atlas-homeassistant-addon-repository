import { describe, expect, it, vi } from "vitest";

import { DefaultEventSubscription } from "../src/events/default/DefaultEventSubscription";

describe("DefaultEventSubscription", () => {

  it("executes dispose callback", async () => {

    const callback = vi.fn();

    const subscription = new DefaultEventSubscription(
      "sub-1",
      "demo",
      callback,
    );

    await subscription.dispose();

    expect(callback).toHaveBeenCalledOnce();

  });

  it("supports multiple dispose calls", async () => {

    const callback = vi.fn();

    const subscription = new DefaultEventSubscription(
      "sub-1",
      "demo",
      callback,
    );

    await subscription.dispose();
    await subscription.dispose();
    await subscription.dispose();

    expect(callback).toHaveBeenCalledOnce();

  });

});
