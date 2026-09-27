import { describe, expect, it } from "vitest";
import type { Lifecycle, LifecycleState } from "../src";

describe("lifecycle contracts", () => {
  it("models the declared lifecycle states through the public contract", () => {
    const states = ["created", "initialized", "running", "stopped", "disposed"] satisfies readonly LifecycleState[];
    const lifecycle: Lifecycle = { state: states[0] };

    expect(states).toEqual(["created", "initialized", "running", "stopped", "disposed"]);
    expect(lifecycle.state).toBe("created");
  });
});
