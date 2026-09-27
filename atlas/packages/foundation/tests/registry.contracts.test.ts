import { describe, expect, it, vi } from "vitest";
import type {
  MutableRegistry,
  ObservableRegistry,
  ReadonlyRegistry,
} from "../src";
import { DefaultRegistry } from "../src/registry";

describe("registry contracts", () => {
  it("supports readonly, mutable and observable views of the same registry", () => {
    const registry = new DefaultRegistry<string, number>();
    const readonly: ReadonlyRegistry<string, number> = registry;
    const mutable: MutableRegistry<string, number> = registry;
    const observable: ObservableRegistry<string, number> = registry;
    const listener = vi.fn();
    const unsubscribe = observable.subscribe(listener);

    mutable.register("temperature", 21);

    expect(readonly.has("temperature")).toBe(true);
    expect(readonly.get("temperature")).toBe(21);
    expect([...readonly.entries()]).toEqual([["temperature", 21]]);
    expect(listener).toHaveBeenCalledWith({ type: "registered", key: "temperature", value: 21 });

    unsubscribe();
    expect(mutable.unregister("temperature")).toBe(true);
    expect(listener).toHaveBeenCalledOnce();
  });
});
