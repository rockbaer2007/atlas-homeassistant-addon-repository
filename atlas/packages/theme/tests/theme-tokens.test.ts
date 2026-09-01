import { describe, expect, it } from "vitest";

import {
  applyThemeTokens,
  createThemeCssVariables,
  createThemeStylesheet,
  createThemeTokens,
  DefaultThemeTokens,
} from "../src";

describe("theme tokens", () => {
  it("creates independent tokens from the ATLAS defaults", () => {
    const tokens = createThemeTokens({ colorAccent: "#c2410c" });

    expect(tokens).toEqual({ ...DefaultThemeTokens, colorAccent: "#c2410c" });
    expect(tokens).not.toBe(DefaultThemeTokens);
  });

  it("creates stable CSS variables for renderer surfaces", () => {
    expect(createThemeCssVariables(createThemeTokens())).toEqual({
      "--atlas-color-background": "#f5f7fb",
      "--atlas-color-surface": "#ffffff",
      "--atlas-color-text": "#172033",
      "--atlas-color-accent": "#0f766e",
      "--atlas-font-family": "system-ui, sans-serif",
      "--atlas-spacing": "16px",
    });
  });

  it("renders theme tokens as a selector-scoped stylesheet", () => {
    expect(createThemeStylesheet(createThemeTokens({ spacing: "12px" }), "#atlas-root")).toBe(
      "#atlas-root {\n"
      + "  --atlas-color-background: #f5f7fb;\n"
      + "  --atlas-color-surface: #ffffff;\n"
      + "  --atlas-color-text: #172033;\n"
      + "  --atlas-color-accent: #0f766e;\n"
      + "  --atlas-font-family: system-ui, sans-serif;\n"
      + "  --atlas-spacing: 12px;\n}",
    );
  });

  it("applies tokens to browser-compatible style targets", () => {
    const values = new Map<string, string>();

    applyThemeTokens({
      style: { setProperty: (name, value) => values.set(name, value) },
    }, createThemeTokens({ colorText: "#111827" }));

    expect(Object.fromEntries(values)).toMatchObject({
      "--atlas-color-text": "#111827",
      "--atlas-color-accent": "#0f766e",
    });
  });
});
