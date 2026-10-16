import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";
import { describe, expect, it } from "vitest";
import { createHomeAssistantCardEditorScriptExport } from "../src/HomeAssistantCardEditorPlan";

const moduleUrl = "https://ha.fixture/local/atlas/card.js?v=1";
function execute(source: string, context: object) {
  const compiled = transformSync(source, { format: "iife", define: { "import.meta.url": JSON.stringify(moduleUrl) } }).code;
  runInNewContext(compiled, { URL, ...context });
}
function element() {
  return { style: {}, textContent: "", setAttribute() {}, children: [] as any[],
    append(node: any) { this.children.push(node); } };
}

describe("generated Expert card runtime", () => {
  it("warns for an unselected missing export locale, keeps live cards and clears the warning after repair and reload", async () => {
    const exported = createHomeAssistantCardEditorScriptExport({
      cardName: "Integrity card", editorMode: "expert", defaultEntityIds: ["sensor.demo"],
      fields: [{ id: "field", target: "entity", entityId: "sensor.demo", column: 0, row: 0, width: 4, height: 2 }],
    }, ["en", "de", "fr"]);
    for (const repaired of [false, true]) {
      let Card: any, nodes: any[] = [], child: any;
      const requests: string[] = [];
      execute(exported.source, {
        HTMLElement: class { shadowRoot: any; attachShadow() { return this.shadowRoot = { replaceChildren: (...items: any[]) => { nodes = items; } }; } },
        document: { createElement: element }, AbortController, setTimeout, clearTimeout,
        fetch: async (url: URL) => {
          const language = url.pathname.split("/").at(-1)!.replace(".json", "");
          requests.push(language);
          return language === "fr" && !repaired ? new Response("missing", { status: 404 })
            : new Response(JSON.stringify({ _meta: { language }, card: { title: "Readable " + language } }));
        },
        customElements: { get: () => undefined, define: (_name: string, value: any) => { Card = value; } },
        window: { customCards: [], loadCardHelpers: async () => ({ createCardElement: () => child = {} }) },
      });
      const card = new Card(); card.hass = { language: "de", states: {} }; card.setConfig({ title: "Own title" });
      await new Promise(resolve => setImmediate(resolve));
      expect(requests.sort()).toEqual(["de", "en", "fr"]);
      expect(card.localizedTitle()).toBe("Own title");
      const notices = nodes.filter(node => node.className === "atlas-card-integrity");
      expect(notices).toHaveLength(repaired ? 0 : 1);
      if (!repaired) {
        expect(notices[0].textContent).toContain("locales/fr.json");
        expect(notices[0].textContent).toContain("vollständige Card-Paket erneut herunterladen");
      }
      card.hass = { language: "de", states: { "sensor.demo": { state: "42" } } };
      expect(child.hass.states["sensor.demo"].state).toBe("42");
      expect(requests).toHaveLength(3);
    }
  });

  it.each(["en", "de", "fr"])("shows a built-in %s repair notice for missing EN and malformed locales without exposing response text", async language => {
    const exported = createHomeAssistantCardEditorScriptExport({ cardName: "Embedded", editorMode: "expert" }, ["en", "de", "fr"]);
    let Card: any, nodes: any[] = [];
    execute(exported.source, {
      HTMLElement: class { shadowRoot: any; attachShadow() { return this.shadowRoot = { replaceChildren: (...items: any[]) => { nodes = items; } }; } },
      document: { createElement: element }, AbortController, setTimeout, clearTimeout,
      fetch: async (url: URL) => new Response("private diagnostic <script>", { status: url.pathname.endsWith("en.json") ? 404 : 200 }),
      customElements: { get: () => undefined, define: (_name: string, value: any) => { Card = value; } },
      window: { customCards: [], loadCardHelpers: async () => ({ createCardElement: () => ({}) }) },
    });
    const card = new Card(); card.hass = { language, states: {} }; card.setConfig({});
    await new Promise(resolve => setImmediate(resolve));
    expect(card.localizedTitle()).toBe("Embedded");
    const notice = nodes.find(node => node.className === "atlas-card-integrity");
    expect(notice.textContent).toContain("locales/en.json, locales/de.json, locales/fr.json");
    expect(notice.textContent).not.toContain("private diagnostic");
    expect(notice.textContent).toContain({ en: "redownload", de: "erneut herunterladen", fr: "retélécharger" }[language]);
  });

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
      document: { createElement: element },
      customElements: { get: (name: string) => registry.get(name), define: (name: string, value: any) => { registry.set(name, value); Card = value; } },
      window: { customCards: [], loadCardHelpers: async () => ({ createCardElement: (value: any) => { config = value; return child; } }) },
    };
    execute(exported.source, context);
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
    execute(exported.source, context);
    expect(context.window.customCards).toHaveLength(1);
  });

  it("loads sibling locales without credentials, merges EN fallbacks and changes language without mutating child names", async () => {
    const exported = createHomeAssistantCardEditorScriptExport({
      cardName: "Authored project", editorMode: "expert", defaultEntityIds: ["sensor.demo"],
      fields: [{ id: "Authored child", target: "entity", entityId: "sensor.demo", column: 0, row: 0, width: 4, height: 2 }],
    });
    let Card: any, nodes: any[] = [], mounts = 0;
    const configurations: any[] = [], requests: any[] = [];
    const locales: Record<string, any> = {
      en: { _meta: { language: "en" }, card: { title: "English title", unavailable: "EN unavailable", replaceDemoEntities: "EN hint" } },
      de: { _meta: { language: "de" }, card: { title: "Deutscher Titel", unavailable: "Nicht verfügbar" } },
      fr: { _meta: { language: "fr" }, card: { title: "Titre français", unavailable: "" } },
    };
    const context = {
      HTMLElement: class { shadowRoot: any; attachShadow() { return this.shadowRoot = { replaceChildren: (...items: any[]) => { nodes = items; mounts++; } }; } },
      document: { createElement: element }, AbortController, setTimeout, clearTimeout,
      fetch: async (url: URL, options: any) => {
        requests.push({ url: url.href, ...options });
        const language = url.pathname.split("/").at(-1)!.replace(".json", "");
        return new Response(locales[language] ? JSON.stringify(locales[language]) : "missing", { status: locales[language] ? 200 : 404 });
      },
      customElements: { get: () => undefined, define: (_name: string, value: any) => { Card = value; } },
      window: { customCards: [], loadCardHelpers: async () => ({ createCardElement: (config: any) => { configurations.push(config); return {}; } }) },
    };
    execute(exported.source, context);
    const card = new Card();
    card.hass = { locale: { language: "de-DE" }, states: {} };
    card.setConfig({ title: "Authored project" });
    await new Promise(resolve => setImmediate(resolve));
    expect(nodes[0].textContent).toBe("Deutscher Titel");
    expect(configurations[0].name).toBe("Authored child");
    expect(card.translated("replaceDemoEntities")).toBe("EN hint");
    expect(nodes[2].textContent).toBe("EN hint");
    expect(nodes[2].hidden).toBe(false);
    const mounted = mounts;
    card.hass = { locale: { language: "de-DE" }, states: { "sensor.demo": { state: "2" } } };
    expect(mounts).toBe(mounted);
    expect(requests).toHaveLength(2);
    expect(nodes[2].hidden).toBe(true);
    expect(requests.every(request => request.credentials === "omit" && request.mode === "same-origin" && request.redirect === "error" && request.cache === "no-cache")).toBe(true);
    expect(requests.map(request => request.url).sort()).toEqual(["https://ha.fixture/local/atlas/locales/de.json", "https://ha.fixture/local/atlas/locales/en.json"]);
    card.hass = { language: "fr_FR", states: {} };
    await new Promise(resolve => setImmediate(resolve));
    expect(nodes[0].textContent).toBe("Titre français");
    expect(card.translated("unavailable")).toBe("EN unavailable");
    card.setConfig({ language: "de", title: "Explicit title", replacement_hint: "Explicit hint" });
    await new Promise(resolve => setImmediate(resolve));
    expect(nodes[0].textContent).toBe("Explicit title");
    expect(card.localizedHint()).toBe("Explicit hint");
    expect(requests).toHaveLength(3);
    card.setConfig({ language: "xx" });
    await new Promise(resolve => setImmediate(resolve));
    expect(nodes[0].textContent).toBe("English title");
  });

  it("keeps embedded English when locale files are missing or malformed and localizes render failures", async () => {
    const exported = createHomeAssistantCardEditorScriptExport({ cardName: "Safe title", editorMode: "expert" });
    let Card: any, nodes: any[] = [];
    execute(exported.source, {
      HTMLElement: class { shadowRoot: any; attachShadow() { return this.shadowRoot = { replaceChildren: (...items: any[]) => { nodes = items; } }; } },
      document: { createElement: element }, AbortController, setTimeout, clearTimeout,
      fetch: async (url: URL) => new Response(url.pathname.endsWith("en.json") ? "not json" : JSON.stringify({ _meta: { language: "fr" }, card: { unavailable: "Wrong language" } })),
      customElements: { get: () => undefined, define: (_name: string, value: any) => { Card = value; } },
      window: { customCards: [], loadCardHelpers: async () => { throw new Error("Internal details"); } },
    });
    const card = new Card(); card.hass = { language: "de", states: {} }; card.setConfig({});
    await new Promise(resolve => setImmediate(resolve));
    expect(card.localizedTitle()).toBe("Safe title");
    expect(nodes[0].textContent).toBe("Unavailable");
    expect(nodes[0].textContent).not.toContain("Internal details");
  });

  it("retains legacy script compatibility while applying title, hint and missing-entity translations", async () => {
    const exported = createHomeAssistantCardEditorScriptExport({ cardName: "Legacy", editorMode: "simple", defaultEntityIds: ["sensor.missing"] });
    let Card: any, nodes: any[] = [];
    const root = { set innerHTML(_value: string) { nodes = []; }, append(node: any) { nodes.push(node); } };
    execute(exported.source, {
      HTMLElement: class { shadowRoot: any; attachShadow() { return this.shadowRoot = root; } },
      document: { createElement: element }, AbortController, setTimeout, clearTimeout,
      fetch: async (url: URL) => {
        const language = url.pathname.endsWith("fr.json") ? "fr" : "en";
        return new Response(JSON.stringify({ _meta: { language }, card: language === "fr"
          ? { title: "Titre", unavailable: "Indisponible", replaceDemoEntities: "Remplacer les entités" } : {} }));
      },
      customElements: { define: (_name: string, value: any) => { Card = value; } },
      window: { customCards: [] },
    });
    const card = new Card(); card.setConfig({}); card.hass = { language: "fr", states: {} };
    await new Promise(resolve => setImmediate(resolve));
    expect(nodes[0].header).toBe("Titre");
    expect(nodes[0].children[0].children[0].textContent).toBe("Remplacer les entités");
    expect(nodes[0].children[0].children[1].children[0].textContent).toBe("sensor.missing: Indisponible");
  });

  it("ignores a slower stale locale and bounds failed requests before using English fallback", async () => {
    const exported = createHomeAssistantCardEditorScriptExport({ cardName: "Embedded English", editorMode: "expert" });
    let Card: any, nodes: any[] = [], resolveFrench: (response: Response) => void;
    const timeouts: Array<() => void> = [], deadlines: number[] = [];
    let requestsFail = false;
    execute(exported.source, {
      HTMLElement: class { shadowRoot: any; attachShadow() { return this.shadowRoot = { replaceChildren: (...items: any[]) => { nodes = items; } }; } },
      document: { createElement: element }, AbortController,
      setTimeout: (callback: () => void, milliseconds: number) => { timeouts.push(callback); deadlines.push(milliseconds); return timeouts.length; },
      clearTimeout() {},
      fetch: async (url: URL, options: any) => {
        if (requestsFail) return new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(new Error("timeout"))));
        const language = url.pathname.split("/").at(-1)!.slice(0, 2);
        if (language === "fr") return new Promise<Response>(resolve => { resolveFrench = resolve; });
        return new Response(JSON.stringify({ _meta: { language }, card: { title: language === "de" ? "Deutsch" : "English file" } }));
      },
      customElements: { get: () => undefined, define: (_name: string, value: any) => { Card = value; } },
      window: { customCards: [], loadCardHelpers: async () => ({ createCardElement: () => ({}) }) },
    });
    const card = new Card(); card.hass = { language: "fr", states: {} }; card.setConfig({});
    card.hass = { language: "de", states: {} };
    await new Promise(resolve => setImmediate(resolve));
    expect(card.localizedTitle()).toBe("Deutsch");
    resolveFrench!(new Response(JSON.stringify({ _meta: { language: "fr" }, card: { title: "Stale French" } })));
    await new Promise(resolve => setImmediate(resolve));
    expect(card.localizedTitle()).toBe("Deutsch");
    requestsFail = true;
    card.setConfig({ language: "xx" });
    timeouts.forEach(callback => callback());
    await new Promise(resolve => setImmediate(resolve));
    expect(card.localizedTitle()).toBe("English file");
    expect(deadlines.every(value => value === 3000)).toBe(true);
  });
});
