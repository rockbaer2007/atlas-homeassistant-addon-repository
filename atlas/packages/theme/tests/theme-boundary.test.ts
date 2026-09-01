import { describe, expect, it } from "vitest";

import {
  createThemeActivationBoundary,
  isThemePublicApiClosed,
} from "../src/ThemeActivationBoundary";
import { inspectThemeActivationGate } from "../src/ThemeActivationGate";
import { inspectThemeDependencyBoundary } from "../src/ThemeDependencyBoundary";
import * as Theme from "../src";

describe("theme activation boundary", () => {
  it("activates Theme above the stable Renderer path", () => {
    expect(createThemeActivationBoundary()).toEqual({
      packageName: "@atlas/theme",
      domain: "theme",
      status: "active",
      requiredLayers: ["core", "renderer"],
      publicApi: {
        state: "open",
        reason: "Theme provides stable tokens and CSS variables for Renderer output.",
      },
      rendererBoundary: {
        tokensOnly: false,
        styleInjectionEnabled: true,
      },
    });
  });

  it("opens the Theme package root with token APIs", () => {
    const boundary = createThemeActivationBoundary();

    expect(isThemePublicApiClosed(boundary)).toBe(false);
    expect(Theme.createThemeTokens).toBeTypeOf("function");
    expect(Theme.createThemeCssVariables).toBeTypeOf("function");
    expect(Theme.createThemeStylesheet).toBeTypeOf("function");
    expect(Theme.applyThemeTokens).toBeTypeOf("function");
    expect(Theme.createThemeRendererStatusOutput).toBeTypeOf("function");
    expect(Theme.executeThemedRendererDomSurfaceScenario).toBeTypeOf("function");
  });

  it("reports the Theme activation gate as active", () => {
    expect(inspectThemeActivationGate(createThemeActivationBoundary())).toEqual({
      active: true,
      missingLayers: [],
      publicApiClosed: false,
      reason: "Theme provides stable tokens and CSS variables for Renderer output.",
    });
  });

  it("allows Renderer while keeping higher integrations and runtime out of Theme", () => {
    expect(inspectThemeDependencyBoundary([
      "@atlas/core",
      "@atlas/renderer",
    ])).toEqual({ ok: true, forbiddenDependencies: [] });
    expect(inspectThemeDependencyBoundary([
      "@atlas/runtime",
      "@atlas/homeassistant",
      "lit",
    ])).toEqual({
      ok: false,
      forbiddenDependencies: ["@atlas/runtime", "@atlas/homeassistant", "lit"],
    });
  });
});
