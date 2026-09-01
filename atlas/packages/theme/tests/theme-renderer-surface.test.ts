import { describe, expect, it } from "vitest";

import {
  createThemeRendererStatusOutput,
  createThemeTokens,
  executeThemedRendererDomSurfaceScenario,
} from "../src";

function createSurfaceElement(): {
  innerHTML: string;
  style: { setProperty(name: string, value: string): void };
  values: Map<string, string>;
} {
  const values = new Map<string, string>();

  return {
    innerHTML: "",
    style: { setProperty: (name, value) => values.set(name, value) },
    values,
  };
}

describe("themed renderer DOM surfaces", () => {
  it("mounts an ATLAS status output and applies its theme tokens", async () => {
    const element = createSurfaceElement();
    const output = createThemeRendererStatusOutput("ready");

    const execution = await executeThemedRendererDomSurfaceScenario({
      output,
      target: { kind: "surface", name: "atlas-status", identifier: "atlas-status-root" },
      element,
      tokens: createThemeTokens({ colorAccent: "#c2410c" }),
    });

    expect(execution.result).toMatchObject({ mounted: true, output });
    expect(execution.report.mounted).toBe(true);
    expect(element.innerHTML).toContain('data-status="ready"');
    expect(element.values.get("--atlas-color-accent")).toBe("#c2410c");
  });

  it("replaces status output while retaining the themed surface", async () => {
    const element = createSurfaceElement();
    const target = { kind: "surface" as const, name: "atlas-status", identifier: "atlas-status-root" };
    const tokens = createThemeTokens({ colorSurface: "#ecfeff" });

    await executeThemedRendererDomSurfaceScenario({
      output: createThemeRendererStatusOutput("pending"),
      target,
      element,
      tokens,
    });
    await executeThemedRendererDomSurfaceScenario({
      output: createThemeRendererStatusOutput("blocked"),
      target,
      element,
      tokens,
    });

    expect(element.innerHTML).toContain('data-status="blocked"');
    expect(element.innerHTML).not.toContain('data-status="pending"');
    expect(element.values.get("--atlas-color-surface")).toBe("#ecfeff");
  });

  it("does not apply tokens when a surface target cannot mount", async () => {
    const element = createSurfaceElement();

    const execution = await executeThemedRendererDomSurfaceScenario({
      output: createThemeRendererStatusOutput("pending"),
      target: { kind: "surface", name: "missing-identifier" },
      element,
      tokens: createThemeTokens(),
    });

    expect(execution.result.mounted).toBe(false);
    expect(element.innerHTML).toBe("");
    expect(element.values.size).toBe(0);
  });
});
