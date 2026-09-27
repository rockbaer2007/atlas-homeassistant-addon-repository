import { describe, expect, it, vi } from "vitest";
import type { Kernel, KernelEvent } from "../src";
import { DefaultServiceContainer } from "../src/container";

describe("kernel contracts", () => {
  it("composes foundation capabilities with the kernel service container", async () => {
    const listener = vi.fn<(event: KernelEvent) => void>();
    const kernel: Kernel = {
      services: new DefaultServiceContainer(),
      initialize: async () => undefined,
      dispose: async () => undefined,
      createSnapshot: () => ({ started: true }),
      subscribe: callback => {
        callback({ type: "ready" });
        return () => undefined;
      },
    };

    await kernel.initialize();
    const unsubscribe = kernel.subscribe(listener);

    expect(kernel.createSnapshot()).toEqual({ started: true });
    expect(listener).toHaveBeenCalledWith({ type: "ready" });
    expect(kernel.services).toBeInstanceOf(DefaultServiceContainer);
    unsubscribe();
    await kernel.dispose();
  });
});
