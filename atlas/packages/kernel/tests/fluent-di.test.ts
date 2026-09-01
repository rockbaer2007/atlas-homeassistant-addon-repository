import { describe,it,expect } from "vitest";
import { createServiceKey } from "../src/di/ServiceKey";
import { ServiceCollectionBuilder } from "../src/di/ServiceCollectionBuilder";

class Logger {}

describe("fluent di",()=>{
  it("creates descriptor",()=>{
    const key=createServiceKey<Logger>("Logger");
    const builder=new ServiceCollectionBuilder();
    const d=builder.addSingleton(key).implementation(Logger);
    expect(d.key.name).toBe("Logger");
  });
});
