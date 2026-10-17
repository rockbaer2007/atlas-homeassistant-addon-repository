import { describe, expect, it } from "vitest";
import {
  convertHomeAssistantCardConfigurationToUixStyle,
  createHomeAssistantCardEditorConfiguration, createHomeAssistantCardEditorHacsBundle,
  createHomeAssistantCardEditorHacsBundleArchive, createHomeAssistantCardEditorHacsBundleReadinessReport,
  createHomeAssistantCardEditorPackagePlan, createHomeAssistantCardExportPackage,
  parseHomeAssistantEntitiesCardConfiguration, readHomeAssistantCardEditorHacsBundleArchivePackage,
  serializeHomeAssistantEntitiesCardConfiguration,
} from "../src";

const css = "\nha-card {\n  color: {{ 'red' if is_state('input_boolean.test', 'on') else 'blue' }};\n}\n\n@media (max-width: 600px) {\n  ha-card { padding: 4px; }\n}\n";
const style = { style: { ".": css, "mushroom-state-info$": "div {\n  font-weight: bold;\n}" }, class: "test-style" };
const cards = [
  { type: "entity", entity: "sensor.test", name: "Entity" },
  { type: "entities", title: "Entities", entities: [{ entity: "sensor.test" }] },
  { type: "glance", entities: [{ entity: "sensor.test" }] },
  { type: "button", entity: "sensor.test", name: "Button" },
  { type: "sensor", entity: "sensor.test", name: "Sensor" },
  { type: "thermostat", entity: "climate.test", name: "Climate" },
  { type: "iframe", url: "https://example.org", title: "Page", aspect_ratio: "50%" },
  { type: "custom:mushroom-template-card", entity: "sensor.test", primary: "{{ states(entity) }}", secondary: "Template" },
  { type: "custom:bubble-card", entity: "sensor.test", card_type: "button", button_type: "state", name: "Bubble" },
  { type: "custom:unknown-card", entity: "sensor.test" },
];

describe("structural card_mod and UIX style preservation", () => {
  it.each(["card_mod", "uix", "uix_style"])("retains %s on supported cards in YAML and JSON", key => {
    for (const fixture of cards) for (const format of ["yaml", "json"] as const) {
      const parsed = parseHomeAssistantEntitiesCardConfiguration(JSON.stringify({ ...fixture, [key]: style }));
      const serialized = serializeHomeAssistantEntitiesCardConfiguration(parsed.card, format);
      const actual = parseHomeAssistantEntitiesCardConfiguration(serialized).card;
      expect((actual as unknown as Record<string, unknown>)[key]).toEqual(style);
      expect(serialized).toContain("mushroom-state-info$");
    }
  });

  it.each(["yaml", "json"] as const)("keeps style ownership through nested %s HACS export/import", format => {
    const raw = { type: "vertical-stack", card_mod: { style: "ha-card { margin: 0; }" }, cards: [
      { ...cards[7], card_mod: style },
      // Same entity, different style and engine: never attach by entity ID.
      { type: "grid", uix: style, cards: [{ ...cards[0], uix_style: { style: css } }] },
      { type: "conditional", conditions: [{ condition: "state", entity: "sensor.test", state: "on" }],
        card_mod: style, card: { ...cards[1], uix: style } },
      { type: "custom:tabbed-card-v2", options: { defaultTabIndex: 0 }, uix_style: style,
        tabs: [{ attributes: { label: "Tab" }, card: { ...cards[8], card_mod: style } }] },
    ] };
    const card = parseHomeAssistantEntitiesCardConfiguration(JSON.stringify(raw)).card;
    if (card.type !== "vertical-stack") throw Error("Expected stack");
    const plan = createHomeAssistantCardEditorPackagePlan({ cardName: "Styles", scriptFilename: "style-roundtrip.js", editorMode: "expert",
      fields: [{ id: "Styles", target: "entity", entityId: "sensor.test", layout: "vertical-stack", rawCard: card,
        entries: card.cards.map((rawCard, i) => ({ id: String(i), entityId: "sensor.test", rawCard })),
        column: 0, row: 0, width: 4, height: 6 }] });
    const generated = createHomeAssistantCardEditorConfiguration(plan);
    const pkg = createHomeAssistantCardExportPackage({ card: generated, format, name: plan.cardName, editorPlan: plan, languages: ["en", "de", "fr"] });
    const bundle = createHomeAssistantCardEditorHacsBundle(pkg), bytes = createHomeAssistantCardEditorHacsBundleArchive(bundle).content;
    const imported = readHomeAssistantCardEditorHacsBundleArchivePackage(bytes);
    const report = createHomeAssistantCardEditorHacsBundleReadinessReport(imported);
    expect(report.checks.filter(check => check.status !== "pass")).toEqual([]);
    expect(imported.summary?.card).toEqual(parseHomeAssistantEntitiesCardConfiguration(JSON.stringify(generated)).card);
    expect(imported.summary?.editorPlan?.fields).toEqual(plan.fields);
    expect(imported.summary?.card).toMatchObject({ card_mod: raw.card_mod, cards: raw.cards });
    const again = createHomeAssistantCardEditorHacsBundleArchive(createHomeAssistantCardEditorHacsBundle(JSON.parse(imported.packageContent!))).content;
    expect(again).toEqual(bytes);
    expect(bundle.files.find(file => file.path === "dist/style-roundtrip.js")?.content).toContain("mushroom-state-info$");
  });

  it("converts only card properties to UIX without mutating or overwriting an existing UIX block", () => {
    const original = parseHomeAssistantEntitiesCardConfiguration(JSON.stringify({
      type: "vertical-stack", card_mod: style, cards: [
        { ...cards[7], card_mod: style },
        { ...cards[0], card_mod: style, uix: { style: "existing" } },
      ],
    })).card;
    const before = JSON.stringify(original), converted = convertHomeAssistantCardConfigurationToUixStyle(original);
    expect(JSON.stringify(original)).toBe(before);
    expect(converted).toMatchObject({ uix: style, cards: [{ uix: style }, { card_mod: style, uix: { style: "existing" } }] });
    expect(converted).not.toHaveProperty("card_mod");
    if (converted.type === "vertical-stack") expect(converted.cards[0]).not.toHaveProperty("card_mod");
  });

  it("keeps styled single-card fields intact instead of rebuilding away their styles or entity lists", () => {
    for (const fixture of cards) {
      const rawCard = parseHomeAssistantEntitiesCardConfiguration(JSON.stringify({ ...fixture, card_mod: style })).card;
      const id = "name" in rawCard && typeof rawCard.name === "string" ? rawCard.name
        : "title" in rawCard && typeof rawCard.title === "string" ? rawCard.title : "Styled";
      const generated = createHomeAssistantCardEditorConfiguration({ editorMode: "expert", fields: [{
        id, target: rawCard.type === "iframe" ? "webpage" : rawCard.type === "custom:mushroom-template-card" ? "mushroom-template" : "entity",
        entityId: "entity" in rawCard && typeof rawCard.entity === "string" ? rawCard.entity : "sensor.test",
        rawCard, column: 0, row: 0, width: 4, height: 2,
      }] });
      expect(generated).toEqual(rawCard);
    }
  });
});
