import { describe, expect, it } from "vitest";
import { stringify } from "yaml";
import {
  createHomeAssistantCardEditorHacsBundle, createHomeAssistantCardEditorHacsBundleArchive,
  createHomeAssistantCardEditorHacsBundleReadinessReport, createHomeAssistantCardEditorPackagePlan,
  createHomeAssistantCardExportPackage, parseHomeAssistantEntitiesCardConfiguration,
  readHomeAssistantCardEditorHacsBundleArchivePackage, serializeHomeAssistantEntitiesCardConfiguration,
} from "../src";

const source = {
  type: "vertical-stack", cards: [{
    type: "conditional",
    conditions: [
      { condition: "numeric_state", entity: "sensor.temperature", above: -1, below: 0 },
      { condition: "or", conditions: [
        { condition: "numeric_state", entity_id: "sensor.temperature", above: "input_number.limit" },
        { condition: "state", entity: "sensor.mode", state_not: ["off", "unknown"] },
      ] },
      { condition: "screen", media_query: "(min-width: 800px)" },
      { condition: "user", users: ["fixture-user"] },
    ],
    card: { type: "entity", entity: "sensor.temperature", name: "Temperature" },
  }],
};

function bundle(format: "json" | "yaml") {
  const card = parseHomeAssistantEntitiesCardConfiguration(JSON.stringify(source)).card;
  const plan = createHomeAssistantCardEditorPackagePlan({
    cardName: "Conditional fixture", scriptFilename: "conditional-fixture.js", editorMode: "expert",
    fields: [{ id: "conditional", target: "entity", entityId: "sensor.temperature", rawCard: card, column: 0, row: 0, width: 4, height: 3 }],
  });
  return createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
    card, format, name: plan.cardName, editorPlan: plan, languages: ["en"],
  }));
}

describe("conditional import and HACS semantic gate", () => {
  it.each(["json", "yaml"] as const)("preserves full nested conditions through %s and HACS", format => {
    const input = format === "yaml" ? stringify(source) : JSON.stringify(source);
    const card = parseHomeAssistantEntitiesCardConfiguration(input).card;
    expect(card).toEqual(source);
    const serialized = serializeHomeAssistantEntitiesCardConfiguration(card, format);
    expect(parseHomeAssistantEntitiesCardConfiguration(serialized).card).toEqual(source);
    const exported = bundle(format);
    const read = readHomeAssistantCardEditorHacsBundleArchivePackage(
      createHomeAssistantCardEditorHacsBundleArchive(exported).content);
    expect(read.importable, read.reason).toBe(true);
    expect(read.summary?.card).toEqual(source);
    expect(createHomeAssistantCardEditorHacsBundleReadinessReport(read).ready).toBe(true);
    const reexport = createHomeAssistantCardEditorHacsBundle(JSON.parse(read.packageContent!));
    expect(createHomeAssistantCardEditorHacsBundleArchive(reexport).content)
      .toEqual(createHomeAssistantCardEditorHacsBundleArchive(exported).content);
  });

  it.each([{}, { above: null }, { below: "" }, { above: [] }, { above: false }])(
    "rejects invalid or missing numeric bounds without dropping a condition: %j", bounds => {
      const invalid = { ...source, cards: [{
        ...source.cards[0], conditions: [{ condition: "numeric_state", entity: "sensor.temperature", ...bounds }],
      }] };
      for (const input of [JSON.stringify(invalid), stringify(invalid)]) {
        expect(() => parseHomeAssistantEntitiesCardConfiguration(input)).toThrow(/numeric_state/);
      }
    });

  it.each(["json", "yaml"] as const)("blocks a previously exported broken %s package in readiness", format => {
    const valid = bundle(format);
    const broken = { ...valid, files: valid.files.map(file => {
      if (!file.path.endsWith(".atlas-card.json")) return file;
      const pkg = JSON.parse(file.content);
      const invalid = { ...source, cards: [{
        ...source.cards[0], conditions: [{ condition: "numeric_state", entity: "sensor.temperature" }],
      }] };
      pkg.content = format === "json" ? JSON.stringify(invalid) : stringify(invalid);
      return { ...file, content: JSON.stringify(pkg) };
    }) };
    const rejected = readHomeAssistantCardEditorHacsBundleArchivePackage(
      createHomeAssistantCardEditorHacsBundleArchive(broken).content);
    expect(rejected.importable).toBe(false);
    expect(rejected.reason).toContain("numeric_state");
    expect(createHomeAssistantCardEditorHacsBundleReadinessReport(rejected).ready).toBe(false);
  });
});
