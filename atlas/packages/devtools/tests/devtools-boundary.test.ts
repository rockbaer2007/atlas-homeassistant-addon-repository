import { describe, expect, it } from "vitest";

import {
  createDevtoolsActivationBoundary,
  isDevtoolsPublicApiClosed,
} from "../src/DevtoolsActivationBoundary";
import { inspectDevtoolsActivationGate } from "../src/DevtoolsActivationGate";
import { inspectDevtoolsDependencyBoundary } from "../src/DevtoolsDependencyBoundary";
import * as Devtools from "../src";

describe("devtools activation boundary", () => {
  it("defines the planned Devtools activation boundary above diagnostics layers", () => {
    const boundary = createDevtoolsActivationBoundary();

    expect(boundary).toEqual({
      packageName: "@atlas/devtools",
      domain: "devtools",
      status: "planned",
      requiredLayers: ["foundation", "kernel", "runtime", "core"],
      publicApi: {
        state: "closed",
        reason: "Devtools activation waits for stable framework diagnostic inspection points.",
      },
      diagnosticsBoundary: {
        inspectionOnly: true,
        mutationEnabled: false,
      },
    });
  });

  it("keeps the Devtools boundary limited to planned diagnostics metadata", () => {
    const boundary = createDevtoolsActivationBoundary();

    expect(Object.keys(boundary).sort()).toEqual([
      "diagnosticsBoundary",
      "domain",
      "packageName",
      "publicApi",
      "requiredLayers",
      "status",
    ]);
    expect(boundary).not.toHaveProperty("workspaceMutation");
    expect(boundary).not.toHaveProperty("devServer");
    expect(boundary).not.toHaveProperty("inspector");
  });

  it("keeps Devtools required layers in activation order", () => {
    const boundary = createDevtoolsActivationBoundary();

    expect(boundary.requiredLayers).toEqual(["foundation", "kernel", "runtime", "core"]);
  });

  it("creates independent Devtools boundary layer lists", () => {
    const first = createDevtoolsActivationBoundary();
    const second = createDevtoolsActivationBoundary();

    expect(first.requiredLayers).toEqual(second.requiredLayers);
    expect(first.requiredLayers).not.toBe(second.requiredLayers);
  });

  it("keeps the Devtools diagnostics boundary inspection-only", () => {
    const boundary = createDevtoolsActivationBoundary();

    expect(boundary.diagnosticsBoundary).toEqual({
      inspectionOnly: true,
      mutationEnabled: false,
    });
    expect(boundary.diagnosticsBoundary).not.toHaveProperty("workspaceMutationEnabled");
    expect(boundary.diagnosticsBoundary).not.toHaveProperty("devServerEnabled");
  });

  it("keeps the Devtools public API closed before activation", () => {
    const boundary = createDevtoolsActivationBoundary();

    expect(isDevtoolsPublicApiClosed(boundary)).toBe(true);
    expect(Object.keys(Devtools)).toEqual([]);
  });

  it("keeps the Devtools package root free of concrete tooling exports", () => {
    expect(Object.hasOwn(Devtools, "createDiagnosticsPanel")).toBe(false);
    expect(Object.hasOwn(Devtools, "mutateWorkspace")).toBe(false);
    expect(Object.hasOwn(Devtools, "startDevServer")).toBe(false);
  });

  it("reports Devtools activation as inactive until required layers are stable", () => {
    const boundary = createDevtoolsActivationBoundary();

    expect(inspectDevtoolsActivationGate(boundary)).toEqual({
      active: false,
      missingLayers: ["foundation", "kernel", "runtime", "core"],
      publicApiClosed: true,
      reason: "Devtools activation waits for stable framework diagnostic inspection points.",
    });
  });

  it("copies activation gate layer requirements away from the boundary object", () => {
    const boundary = createDevtoolsActivationBoundary();
    const gate = inspectDevtoolsActivationGate(boundary);

    expect(gate.missingLayers).toEqual(boundary.requiredLayers);
    expect(gate.missingLayers).not.toBe(boundary.requiredLayers);
  });

  it("keeps Devtools activation gate reports independent from later layer mutations", () => {
    const requiredLayers = ["foundation"] as Array<"foundation" | "kernel" | "runtime" | "core">;
    const boundary = {
      ...createDevtoolsActivationBoundary(),
      requiredLayers,
    };

    const gate = inspectDevtoolsActivationGate(boundary);
    requiredLayers.push("kernel");

    expect(gate.missingLayers).toEqual(["foundation"]);
  });

  it("copies the Devtools activation gate reason from the public API closure", () => {
    const boundary = createDevtoolsActivationBoundary();

    expect(inspectDevtoolsActivationGate(boundary).reason).toBe(boundary.publicApi.reason);
  });

  it("keeps concrete Devtools dependencies outside the package before activation", () => {
    expect(inspectDevtoolsDependencyBoundary([])).toEqual({
      ok: true,
      forbiddenDependencies: [],
    });

    expect(inspectDevtoolsDependencyBoundary([
      "@atlas/renderer",
      "@atlas/theme",
      "vite",
    ])).toEqual({
      ok: false,
      forbiddenDependencies: ["@atlas/renderer", "@atlas/theme", "vite"],
    });
  });

  it("allows foundation, kernel, runtime and core dependencies before Devtools activation", () => {
    expect(inspectDevtoolsDependencyBoundary([
      "@atlas/foundation",
      "@atlas/kernel",
      "@atlas/runtime",
      "@atlas/core",
    ])).toEqual({
      ok: true,
      forbiddenDependencies: [],
    });
  });

  it("preserves forbidden Devtools dependency order and duplicates", () => {
    expect(inspectDevtoolsDependencyBoundary([
      "@atlas/theme",
      "@atlas/renderer",
      "@atlas/theme",
      "vite",
    ])).toEqual({
      ok: false,
      forbiddenDependencies: [
        "@atlas/theme",
        "@atlas/renderer",
        "@atlas/theme",
        "vite",
      ],
    });
  });

  it("keeps Devtools dependency boundary reports independent from source arrays", () => {
    const dependencies = ["@atlas/theme"];

    const report = inspectDevtoolsDependencyBoundary(dependencies);
    dependencies.push("vite");

    expect(report.forbiddenDependencies).toEqual(["@atlas/theme"]);
    expect(report.forbiddenDependencies).not.toBe(dependencies);
  });
});
