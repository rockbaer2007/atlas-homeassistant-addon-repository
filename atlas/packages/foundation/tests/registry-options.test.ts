import { describe,it,expect } from "vitest";
import { DefaultRegistryOptions } from "../src/registry/options/DefaultRegistryOptions";

describe("registry options",()=>{
  it("provides defaults",()=>{
    expect(DefaultRegistryOptions.features.events).toBe(true);
  });
});
