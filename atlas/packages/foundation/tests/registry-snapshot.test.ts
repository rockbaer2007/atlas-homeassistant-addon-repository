import {describe,it,expect} from "vitest";
import { createSnapshot } from "../src/registry/snapshot";

describe("registry snapshot",()=>{
  it("creates immutable snapshot",()=>{
    const snap=createSnapshot(new Map([["a",1],["b",2]]).entries());
    expect(snap.count).toBe(2);
    expect(snap.entries[0].key).toBe("a");
  });
});
