import { describe, expect, it } from "vitest";

import {
  createRendererDomSurfaceRegistry,
  createRendererDomSurfaceMountAdapterRegistry,
  createRendererOutput,
  createRendererTarget,
  executeRendererDomSurfaceScenario,
  executeRendererTargetMountWithReport,
  findRendererDomSurface,
  mountRendererOutputToDomSurface,
} from "../src";

describe("renderer DOM surfaces", () => {
  it("mounts Renderer output into a concrete DOM-compatible surface", () => {
    const element = { innerHTML: "<p>Before</p>" };
    const registry = createRendererDomSurfaceRegistry([{
      identifier: "atlas-status-root",
      element,
    }]);
    const output = createRendererOutput({
      kind: "document",
      name: "atlas-status",
      content: "<main><h1>ATLAS ready</h1></main>",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "atlas-status-panel",
      identifier: "atlas-status-root",
    });

    expect(mountRendererOutputToDomSurface({ output, target }, registry)).toEqual({
      mounted: true,
      output,
      target,
    });
    expect(element.innerHTML).toBe("<main><h1>ATLAS ready</h1></main>");
  });

  it("finds DOM surfaces by their target identifier and copies registry arrays", () => {
    const surface = {
      identifier: "atlas-preview-root",
      element: { innerHTML: "" },
    };
    const surfaces = [surface];
    const registry = createRendererDomSurfaceRegistry(surfaces);

    surfaces.pop();

    expect(findRendererDomSurface(registry, "atlas-preview-root")).toEqual({
      identifier: "atlas-preview-root",
      surface,
    });
    expect(findRendererDomSurface(registry, "missing-root")).toEqual({
      identifier: "missing-root",
      surface: undefined,
    });
  });

  it("rejects DOM surface mounts without a surface identifier or matching element", () => {
    const registry = createRendererDomSurfaceRegistry();
    const output = createRendererOutput({ kind: "fragment", name: "empty" });
    const unnamedTarget = createRendererTarget({ kind: "surface", name: "unnamed" });
    const missingTarget = createRendererTarget({
      kind: "surface",
      name: "missing",
      identifier: "not-registered",
    });

    expect(mountRendererOutputToDomSurface({ output, target: unnamedTarget }, registry).error).toBe(
      "Renderer DOM surface mounting requires a target identifier.",
    );
    expect(mountRendererOutputToDomSurface({ output, target: missingTarget }, registry).error).toBe(
      "Renderer DOM surface not-registered was not found.",
    );
  });

  it("executes complete DOM surface scenarios", () => {
    const element = { innerHTML: "" };
    const output = createRendererOutput({
      kind: "fragment",
      name: "scenario-output",
      content: "<aside>Scenario</aside>",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "scenario-target",
      identifier: "scenario-root",
    });

    expect(executeRendererDomSurfaceScenario({
      output,
      target,
      registry: createRendererDomSurfaceRegistry([{ identifier: "scenario-root", element }]),
    })).toMatchObject({ mounted: true, output, target });
    expect(element.innerHTML).toBe("<aside>Scenario</aside>");
  });

  it("routes renderer target mount reports into registered DOM surfaces", async () => {
    const element = { innerHTML: "" };
    const routing = createRendererDomSurfaceMountAdapterRegistry([{
      identifier: "routed-root",
      element,
    }]);
    const output = createRendererOutput({
      kind: "fragment",
      name: "routed-status",
      content: "<p>Mounted by ATLAS</p>",
    });
    const target = createRendererTarget({
      kind: "surface",
      name: "routed-status-panel",
      identifier: "routed-root",
    });

    const execution = await executeRendererTargetMountWithReport({
      output,
      target,
      registry: routing.registry,
    });

    expect(execution.result).toEqual({ mounted: true, output, target });
    expect(execution.report.mounted).toBe(true);
    expect(element.innerHTML).toBe("<p>Mounted by ATLAS</p>");
    expect(routing.memoryAdapter.store.records).toEqual([]);
  });
});
