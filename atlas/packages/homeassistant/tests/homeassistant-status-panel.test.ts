import { describe, expect, it } from "vitest";

import { createThemeTokens } from "@atlas/theme";

import {
  bindHomeAssistantEntityStatusPanel,
  createHomeAssistantStatusPanel,
  createHomeAssistantEntityState,
  createInMemoryHomeAssistantEntityStateTransport,
  renderHomeAssistantStatusPanel,
} from "../src";

describe("Home Assistant status panel", () => {
  it("renders a themed status panel through the active Renderer surface path", async () => {
    const values = new Map<string, string>();
    const element = {
      innerHTML: "",
      style: { setProperty: (name: string, value: string) => values.set(name, value) },
    };
    const panel = createHomeAssistantStatusPanel({
      id: "atlas-home-status",
      title: "ATLAS status",
      targetIdentifier: "atlas-home-status-root",
    });

    const execution = await renderHomeAssistantStatusPanel({
      panel,
      status: "ready",
      element,
      tokens: createThemeTokens({ colorAccent: "#2563eb" }),
    });

    expect(execution.result.mounted).toBe(true);
    expect(execution.report.mounted).toBe(true);
    expect(element.innerHTML).toContain('data-status="ready"');
    expect(values.get("--atlas-color-accent")).toBe("#2563eb");
  });

  it("replaces the panel status in the same Home Assistant target", async () => {
    const element = {
      innerHTML: "",
      style: { setProperty: () => undefined },
    };
    const panel = createHomeAssistantStatusPanel({
      id: "atlas-home-status",
      title: "ATLAS status",
      targetIdentifier: "atlas-home-status-root",
    });
    const tokens = createThemeTokens();

    await renderHomeAssistantStatusPanel({ panel, status: "pending", element, tokens });
    await renderHomeAssistantStatusPanel({ panel, status: "blocked", element, tokens });

    expect(element.innerHTML).toContain('data-status="blocked"');
    expect(element.innerHTML).not.toContain('data-status="pending"');
  });

  it("streams a live entity through the themed Renderer surface and disposes its binding", async () => {
    const values = new Map<string, string>();
    const element = {
      innerHTML: "",
      style: { setProperty: (name: string, value: string) => values.set(name, value) },
    };
    const panel = createHomeAssistantStatusPanel({
      id: "boiler-status",
      title: "Boiler status",
      targetIdentifier: "boiler-status-root",
    });
    const transport = createInMemoryHomeAssistantEntityStateTransport();
    const binding = bindHomeAssistantEntityStatusPanel({
      transport,
      panel,
      entityId: "sensor.boiler_temperature",
      element,
      tokens: createThemeTokens({ colorAccent: "#e87522" }),
    });

    await transport.publish(createHomeAssistantEntityState({
      entityId: "sensor.room_temperature",
      state: "off",
      value: "19",
      unit: "°C",
    }));
    expect(element.innerHTML).toBe("");

    await transport.publish(createHomeAssistantEntityState({
      entityId: "sensor.boiler_temperature",
      state: "available",
      value: "56",
      name: "Boiler",
      unit: "°C",
    }));

    expect(element.innerHTML).toContain('data-status="ready"');
    expect(element.innerHTML).toContain("Boiler");
    expect(element.innerHTML).toContain("56 °C");
    expect(values.get("--atlas-color-accent")).toBe("#e87522");

    binding.dispose();
    await transport.publish(createHomeAssistantEntityState({
      entityId: "sensor.boiler_temperature",
      state: "unavailable",
      name: "Boiler",
    }));
    expect(element.innerHTML).toContain('data-status="ready"');
  });
});
