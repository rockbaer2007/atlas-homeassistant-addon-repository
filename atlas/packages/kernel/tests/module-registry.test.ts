import { describe,it,expect } from "vitest";
import { ModuleRegistry } from "../src/modules";

describe("ModuleRegistry",()=>{
  it("stores descriptors",()=>{
    const r=new ModuleRegistry();
    r.add({
      manifest:{
        id:"core",
        name:"Core",
        version:"1.0.0",
        dependencies:[]
      },
      loaded:false
    });

    expect(r.get("core")?.manifest.name).toBe("Core");
  });
});
