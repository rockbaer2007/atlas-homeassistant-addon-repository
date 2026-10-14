import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { createHomeAssistantCardEditorScriptExport } from "../src/HomeAssistantCardEditorPlan";

describe("generated Expert card runtime", () => {
  it("mounts the exported layout, remaps entities and forwards live updates without recreating cards", async () => {
    const exported = createHomeAssistantCardEditorScriptExport({
      editorMode: "expert", defaultEntityIds: ["sensor.demo"],
      fields: ["entity", "bubble", "mushroom-template"].map((target, i) => ({
        id: target, target: target as "entity" | "bubble" | "mushroom-template",
        entityId: "sensor.demo", bubbleButtonType: "state", layout: "card",
        column: i * 4, row: 0, width: 4, height: 2,
      })),
    });
    let Card: any;
    let config: any;
    let mounts = 0;
    const child: any = {};
    const registry = new Map();
    const context = {
      HTMLElement: class {
        shadowRoot: any;
        attachShadow() { return this.shadowRoot = { replaceChildren: (...nodes: any[]) => { if (nodes.length) mounts++; } }; }
      },
      document: { createElement: () => ({}) },
      customElements: { get: (name: string) => registry.get(name), define: (name: string, value: any) => { registry.set(name, value); Card = value; } },
      window: { customCards: [], loadCardHelpers: async () => ({ createCardElement: (value: any) => { config = value; return child; } }) },
    };
    runInNewContext(`(() => { ${exported.source} })()`, context);
    const card = new Card();
    card.hass = { states: { "sensor.actual": { state: "1" } } };
    card.setConfig({ entities: ["sensor.actual"] });
    await new Promise<void>(resolve => setImmediate(resolve));
    expect(config.type).toBe("horizontal-stack");
    expect(config.cards.map((item: any) => item.type)).toEqual(["entity", "custom:bubble-card", "custom:mushroom-template-card"]);
    expect(config.cards.every((item: any) => item.entity === "sensor.actual")).toBe(true);
    expect(child.hass.states["sensor.actual"].state).toBe("1");
    card.hass = { states: { "sensor.actual": { state: "2" } } };
    expect(child.hass.states["sensor.actual"].state).toBe("2");
    expect(mounts).toBe(1);
    runInNewContext(`(() => { ${exported.source} })()`, context);
    expect(context.window.customCards).toHaveLength(1);
  });
});
