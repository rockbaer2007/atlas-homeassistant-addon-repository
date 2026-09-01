import { describe, it, expect } from "vitest";
import {
  DefaultServiceContainer,
  ServiceLifetimes
} from "../src/container";

describe("DefaultServiceContainer", () => {
  it("resolves singleton once", () => {
    const key = Symbol("svc");
    let created = 0;

    const c = new DefaultServiceContainer();
    c.add({
      key,
      lifetime: ServiceLifetimes.Singleton,
      factory: () => ({ id: ++created })
    });

    const a = c.resolve<{id:number}>(key);
    const b = c.resolve<{id:number}>(key);

    expect(a.id).toBe(1);
    expect(b.id).toBe(1);
  });

  it("registers a service instance through the public contract", () => {
    const key = Symbol("instance");
    const container = new DefaultServiceContainer();
    const value = { ready: true };

    container.register(key, value);

    expect(container.resolve(key)).toBe(value);
  });
});
