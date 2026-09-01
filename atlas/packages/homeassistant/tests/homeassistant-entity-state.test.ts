import { describe, expect, it } from "vitest";

import {
  createHomeAssistantConnectionConfiguration,
  createHomeAssistantEntityPresentation,
  createHomeAssistantEntityState,
  createHomeAssistantPanelGroup,
  createInMemoryHomeAssistantEntityStateTransport,
  createHomeAssistantStatusPanel,
  createHomeAssistantStatusPanelRegistry,
  findHomeAssistantStatusPanel,
  findHomeAssistantPanelGroup,
  inspectHomeAssistantConnectionReadiness,
  deriveHomeAssistantWebSocketUrl,
  mapHomeAssistantEntityStateToStatus,
  renderHomeAssistantEntityStatusPanel,
  bindHomeAssistantEntityStatusPanel,
} from "../src";
import { createThemeTokens } from "@atlas/theme";

describe("Home Assistant entity status panels", () => {
  it("maps Home Assistant entity states onto ATLAS panel statuses", () => {
    expect(mapHomeAssistantEntityStateToStatus(
      createHomeAssistantEntityState({ entityId: "binary_sensor.atlas", state: "on" }),
    )).toBe("ready");
    expect(mapHomeAssistantEntityStateToStatus(
      createHomeAssistantEntityState({ entityId: "binary_sensor.atlas", state: "off" }),
    )).toBe("pending");
    expect(mapHomeAssistantEntityStateToStatus(
      createHomeAssistantEntityState({ entityId: "sensor.atlas_temperature", state: "available" }),
    )).toBe("ready");
    expect(mapHomeAssistantEntityStateToStatus(
      createHomeAssistantEntityState({ entityId: "binary_sensor.atlas", state: "unavailable" }),
    )).toBe("blocked");
    expect(mapHomeAssistantEntityStateToStatus(
      createHomeAssistantEntityState({ entityId: "binary_sensor.atlas", state: "unknown" }),
    )).toBe("blocked");
  });

  it("registers and finds Home Assistant status panels without source-array mutation", () => {
    const panel = createHomeAssistantStatusPanel({
      id: "atlas-health",
      title: "ATLAS health",
      targetIdentifier: "atlas-health-root",
    });
    const panels = [panel];
    const registry = createHomeAssistantStatusPanelRegistry(panels);

    panels.pop();

    expect(findHomeAssistantStatusPanel(registry, "atlas-health")).toBe(panel);
    expect(findHomeAssistantStatusPanel(registry, "missing")).toBeUndefined();
    expect(registry.panels).toEqual([panel]);
  });

  it("creates reusable groups and entity-specific presentations", () => {
    const group = createHomeAssistantPanelGroup({
      id: "energy",
      title: "Energy",
      entityIds: ["sensor.atlas_power"],
    });
    expect(findHomeAssistantPanelGroup([group], "energy")).toBe(group);
    expect(createHomeAssistantEntityPresentation(createHomeAssistantEntityState({
      entityId: "sensor.atlas_power",
      state: "available",
      value: "210",
      unit: "W",
    }))).toEqual({ category: "power", label: "sensor.atlas_power", detail: "W" });
  });

  it("renders entity updates through the status panel", async () => {
    const element = {
      innerHTML: "",
      style: { setProperty: () => undefined },
    };
    const panel = createHomeAssistantStatusPanel({
      id: "atlas-entity",
      title: "ATLAS entity",
      targetIdentifier: "atlas-entity-root",
    });

    const execution = await renderHomeAssistantEntityStatusPanel({
      panel,
      entity: createHomeAssistantEntityState({ entityId: "binary_sensor.atlas", state: "off" }),
      element,
      tokens: createThemeTokens(),
    });

    expect(execution.result.mounted).toBe(true);
    expect(element.innerHTML).toContain('data-status="pending"');

    const sensorExecution = await renderHomeAssistantEntityStatusPanel({
      panel,
      entity: createHomeAssistantEntityState({
        entityId: "sensor.atlas_temperature",
        state: "available",
        value: "21.5",
        name: "Office temperature",
        unit: "°C",
      }),
      element,
      tokens: createThemeTokens(),
    });
    expect(sensorExecution.result.mounted).toBe(true);
    expect(element.innerHTML).toContain("Office temperature");
    expect(element.innerHTML).toContain("21.5 °C");
  });

  it("checks connection configuration without opening a Home Assistant connection", () => {
    expect(inspectHomeAssistantConnectionReadiness(
      createHomeAssistantConnectionConfiguration({ url: "https://home.example.test" }),
    )).toEqual({ ready: true });
    expect(inspectHomeAssistantConnectionReadiness(
      createHomeAssistantConnectionConfiguration({ url: "ws://home.example.test" }),
    )).toEqual({
      ready: false,
      reason: "Home Assistant connection requires an HTTP or HTTPS URL.",
    });
    expect(deriveHomeAssistantWebSocketUrl(
      createHomeAssistantConnectionConfiguration({ url: "https://home.example.test/lovelace?tab=1" }),
    )).toBe("wss://home.example.test/api/websocket");
    expect(deriveHomeAssistantWebSocketUrl(
      createHomeAssistantConnectionConfiguration({ url: "invalid" }),
    )).toBeUndefined();
  });

  it("publishes local entity updates into bound status panels", async () => {
    const transport = createInMemoryHomeAssistantEntityStateTransport();
    const element = {
      innerHTML: "",
      style: { setProperty: () => undefined },
    };
    const panel = createHomeAssistantStatusPanel({
      id: "atlas-bound-entity",
      title: "ATLAS bound entity",
      targetIdentifier: "atlas-bound-entity-root",
    });
    const binding = bindHomeAssistantEntityStatusPanel({
      transport,
      panel,
      entityId: "binary_sensor.atlas",
      element,
      tokens: createThemeTokens(),
    });

    await transport.publish(createHomeAssistantEntityState({
      entityId: "binary_sensor.atlas",
      state: "on",
    }));

    expect(transport.getLatest("binary_sensor.atlas")).toEqual({
      entityId: "binary_sensor.atlas",
      state: "on",
    });
    expect(element.innerHTML).toContain('data-status="ready"');

    binding.dispose();
    await transport.publish(createHomeAssistantEntityState({
      entityId: "binary_sensor.atlas",
      state: "unavailable",
    }));

    expect(element.innerHTML).toContain('data-status="ready"');
  });
});
