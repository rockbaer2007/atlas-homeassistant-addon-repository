import { describe, expect, it } from "vitest";
import { DefaultServiceContainer, ServiceLifetimes } from "../src/container";

describe("ServiceDescriptor", () => {

  it("supports instance registration", () => {
    const key = { id: Symbol("instance") };

    const c = new DefaultServiceContainer();

    c.add({
      key,
      lifetime: ServiceLifetimes.Singleton,
      instance: 123
    });

    expect(c.resolve<number>(key.id)).toBe(123);
  });

});
