import { describe, expect, it } from "vitest";

import {
  ModuleDependencyResolver,
  type ModuleDescriptor,
} from "../src/modules";

function descriptor(
  id: string,
  dependencies: ModuleDescriptor["manifest"]["dependencies"] = [],
  version = "1.0.0",
): ModuleDescriptor {
  return {
    manifest: {
      id,
      name: id,
      version,
      dependencies,
    },
    loaded: false,
  };
}

describe("ModuleDependencyResolver", () => {
  it("orders dependencies before their dependents", () => {
    const resolver = new ModuleDependencyResolver();
    const dependent = descriptor("dependent", [{ id: "dependency", version: "1.0.0" }]);
    const dependency = descriptor("dependency");

    const resolved = resolver.resolve([dependent, dependency]);

    expect(resolved.map(module => module.manifest.id)).toEqual([
      "dependency",
      "dependent",
    ]);
  });

  it("rejects a missing required dependency", () => {
    const resolver = new ModuleDependencyResolver();

    expect(() => resolver.resolve([
      descriptor("dependent", [{ id: "missing", version: "1.0.0" }]),
    ])).toThrow("Module dependency not found: dependent -> missing");
  });

  it("allows a missing optional dependency", () => {
    const resolver = new ModuleDependencyResolver();

    expect(resolver.resolve([
      descriptor("optional", [{ id: "missing", version: "1.0.0", optional: true }]),
    ]).map(module => module.manifest.id)).toEqual(["optional"]);
  });

  it("accepts compatible caret dependencies", () => {
    const resolver = new ModuleDependencyResolver();
    const dependent = descriptor(
      "dependent",
      [{ id: "dependency", version: "^1.2.0" }],
    );
    const dependency = descriptor("dependency", [], "1.4.0");

    expect(resolver.resolve([dependent, dependency]))
      .toHaveLength(2);
  });

  it("rejects incompatible dependency versions", () => {
    const resolver = new ModuleDependencyResolver();
    const dependent = descriptor(
      "dependent",
      [{ id: "dependency", version: "^1.2.0" }],
    );
    const dependency = descriptor("dependency", [], "2.0.0");

    expect(() => resolver.resolve([dependent, dependency]))
      .toThrow("Module dependency version incompatible");
  });

  it("treats pre-1.0 caret dependencies as minor-version compatible", () => {
    const resolver = new ModuleDependencyResolver();
    const dependent = descriptor(
      "dependent",
      [{ id: "dependency", version: "^0.2.1" }],
    );

    expect(resolver.resolve([
      dependent,
      descriptor("dependency", [], "0.2.4"),
    ])).toHaveLength(2);

    expect(() => resolver.resolve([
      dependent,
      descriptor("dependency", [], "0.3.0"),
    ])).toThrow("Module dependency version incompatible");
  });

  it("rejects cyclic dependencies", () => {
    const resolver = new ModuleDependencyResolver();
    const first = descriptor("first", [{ id: "second", version: "1.0.0" }]);
    const second = descriptor("second", [{ id: "first", version: "1.0.0" }]);

    expect(() => resolver.resolve([first, second]))
      .toThrow("Module dependency cycle detected.");
  });
});
