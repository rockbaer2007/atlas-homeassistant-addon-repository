import { describe,it,expect } from "vitest";
import { success,failure,isSuccess,isFailure } from "../src/result";

describe("result",()=>{
  it("creates success",()=>{
    const r=success(42);
    expect(isSuccess(r)).toBe(true);
    expect(r.value).toBe(42);
  });

  it("creates failure",()=>{
    const r=failure("ERR");
    expect(isFailure(r)).toBe(true);
  });
});
