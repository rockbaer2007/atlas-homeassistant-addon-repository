import { describe, expect, it } from "vitest";

import {
  createHomeAssistantIntegrationBoundary,
  isHomeAssistantPublicApiClosed,
} from "../src/HomeAssistantIntegrationBoundary";
import { inspectHomeAssistantActivationGate } from "../src/HomeAssistantActivationGate";
import { inspectHomeAssistantDependencyBoundary } from "../src/HomeAssistantDependencyBoundary";
import * as HomeAssistant from "../src";

describe("homeassistant integration boundary", () => {
  it("activates the first Home Assistant status panel boundary", () => {
    expect(createHomeAssistantIntegrationBoundary()).toEqual({
      packageName: "@atlas/homeassistant",
      integration: "home-assistant",
      status: "active",
      requiredLayers: ["runtime", "renderer", "theme"],
      publicApi: {
        state: "open",
        reason: "Home Assistant provides a themed status panel on the active Renderer surface path.",
      },
      rendererBoundary: {
        platformMetadataOnly: false,
        concreteMountingEnabled: true,
      },
    });
  });

  it("opens the Home Assistant package root with the status panel API", () => {
    expect(isHomeAssistantPublicApiClosed(createHomeAssistantIntegrationBoundary())).toBe(false);
    expect(HomeAssistant.createHomeAssistantStatusPanel).toBeTypeOf("function");
    expect(HomeAssistant.renderHomeAssistantStatusPanel).toBeTypeOf("function");
  });

  it("reports the status panel activation gate as active", () => {
    expect(inspectHomeAssistantActivationGate(createHomeAssistantIntegrationBoundary())).toEqual({
      active: true,
      missingLayers: [],
      publicApiClosed: false,
      reason: "Home Assistant provides a themed status panel on the active Renderer surface path.",
    });
  });

  it("allows Runtime and Theme while keeping direct Renderer and websocket dependencies out", () => {
    expect(inspectHomeAssistantDependencyBoundary([
      "@atlas/runtime",
      "@atlas/theme",
    ])).toEqual({ ok: true, forbiddenDependencies: [] });
    expect(inspectHomeAssistantDependencyBoundary([
      "@atlas/renderer",
      "home-assistant-js-websocket",
    ])).toEqual({
      ok: false,
      forbiddenDependencies: [
        "@atlas/renderer",
        "home-assistant-js-websocket",
      ],
    });
  });
});
