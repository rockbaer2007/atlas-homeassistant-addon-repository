import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { stringify } from "yaml";
import { describe, expect, it } from "vitest";
import {
  createHomeAssistantCardEditorConfiguration, createHomeAssistantCardEditorFieldFromTemplate,
  createHomeAssistantCardEditorPackagePlan, summarizeHomeAssistantCardImport,
  serializeHomeAssistantEntitiesCardConfiguration,
  createHomeAssistantCardExportPackage, createHomeAssistantCardEditorHacsBundle,
  createHomeAssistantCardEditorHacsBundleArchive, readHomeAssistantCardEditorHacsBundleArchivePackage,
  createHomeAssistantCardEditorHacsBundleReadinessReport,
} from "../src";

// Exercise the shipped Editor conversion, not only the successful raw-card parser.
function editorFields(card: object) {
  const source = readFileSync(new URL("../../../examples/status-demo/app.js", import.meta.url), "utf8");
  const parsed = ts.createSourceFile("app.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const names = new Set(["createExpertFieldsFromImportedCard", "cloneImportedCard",
    "getSimplePreviewCardEntities", "collectSimplePreviewCardEntities", "getSimplePreviewCardTitle",
    "getImportedCardTarget"]);
  const functions = parsed.statements.filter(node => ts.isFunctionDeclaration(node) && names.has(node.name!.text))
    .map(node => node.getText(parsed)).join("\n");
  return runInNewContext(functions + "\ncreateExpertFieldsFromImportedCard(card)", {
    card, createHomeAssistantCardEditorFieldFromTemplate,
    formatEntityIdAsTitle: () => "Derived entity label",
  });
}

const entity = { type: "entity" as const, entity: "sensor.fixture_value", name: "Eigener Name – Küche",
  icon: "mdi:home", attribute: "unit_of_measurement" };
const conditional = (card: object) => ({ type: "conditional" as const, conditions: [
  { condition: "numeric_state", entity: "sensor.other_condition", above: 0, below: 10 },
  { condition: "or", conditions: [{ condition: "state", entity: "sensor.mode", state: ["on", "idle"] },
    { condition: "screen", media_query: "(min-width: 600px)" }] },
], card });
const fixtures = [entity, { ...entity, name: "" }, { ...entity, name: "  Literal name  " },
  conditional(entity), conditional(conditional(entity)),
  conditional({ type: "iframe", url: "https://example.invalid/", title: "No entity needed" }),
  conditional({ type: "custom:mushroom-template-card", entity: "sensor.fixture_value", primary: "{{ states(entity) }}" }),
  conditional({ type: "custom:bubble-card", card_type: "button", button_type: "state", entity: "sensor.fixture_value", name: "Bubble" }),
];

describe("standalone Card import through the actual Expert field conversion", () => {
  for (const format of ["json", "yaml"] as const) {
    for (const name of ["", " ", "  Literal name  ", "\tKüche\t"]) {
      const leaf = { type: "entity", entity: "sensor.fixture_value", name };
      for (const source of [leaf, conditional(leaf), conditional(conditional(leaf))]) {
        it(`retains the original literal name before parsing through ${format}: ${JSON.stringify(source)}`, () => {
          // Compare with the unparsed source: normalizing first hid the old loss.
          const text = format === "json" ? JSON.stringify(source) : stringify(source);
          const summary = summarizeHomeAssistantCardImport(text);
          expect(summary.card).toEqual(source);
          const fields = editorFields(summary.card);
          const plan = createHomeAssistantCardEditorPackagePlan(JSON.parse(JSON.stringify({ editorMode: "expert", fields })));
          const output = createHomeAssistantCardEditorConfiguration(plan);
          expect(output).toEqual(source);
          const exported = createHomeAssistantCardExportPackage({ card: output, format, editorPlan: plan });
          expect(summarizeHomeAssistantCardImport(JSON.stringify(exported)).card).toEqual(source);
        });
      }
      it(`retains the original literal name through ${format} HACS: ${JSON.stringify(name)}`, () => {
        const source = conditional(leaf);
        const summary = summarizeHomeAssistantCardImport(format === "json" ? JSON.stringify(source) : stringify(source));
        const plan = createHomeAssistantCardEditorPackagePlan({ editorMode: "expert", fields: editorFields(summary.card) });
        const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
          card: createHomeAssistantCardEditorConfiguration(plan), format, editorPlan: plan, name: plan.cardName,
        }));
        const imported = readHomeAssistantCardEditorHacsBundleArchivePackage(createHomeAssistantCardEditorHacsBundleArchive(bundle).content);
        expect(imported.importable, imported.reason).toBe(true);
        expect(imported.summary?.card).toEqual(source);
        expect(createHomeAssistantCardEditorConfiguration(imported.summary!.editorPlan!)).toEqual(source);
      });
    }
  }
  it("retains the missing-name fallback for an Entity card", () => {
    expect(summarizeHomeAssistantCardImport(JSON.stringify({ type: "entity", entity: "sensor.fixture_value" })).card)
      .toEqual({ type: "entity", entity: "sensor.fixture_value", name: "Imported entity card" });
  });
  it.each(["", " ", "  Literal name  ", "\tKüche\t"])("allows deliberate renaming without mutating the literal source: %j", name => {
    const source = { type: "entity", entity: "sensor.fixture_value", name };
    const summary = summarizeHomeAssistantCardImport(JSON.stringify(source));
    const fields = editorFields(summary.card);
    expect(createHomeAssistantCardEditorConfiguration({ editorMode: "expert", fields: [
      { ...fields[0], id: "New title", entityId: "sensor.new_value" },
    ] })).toEqual({ ...source, name: "New title", entity: "sensor.new_value" });
    expect(summary.card).toEqual(source);
  });
  for (const format of ["json", "yaml"] as const) {
    it.each(fixtures)(`preserves standalone content through ${format}, draft reload and export: %j`, fixture => {
      const normalized = summarizeHomeAssistantCardImport(JSON.stringify(fixture)).card;
      const text = serializeHomeAssistantEntitiesCardConfiguration(normalized, format);
      const summary = summarizeHomeAssistantCardImport(text);
      const original = JSON.stringify(summary.card);
      const fields = editorFields(summary.card);
      expect(fields).toHaveLength(1);
      expect(fields[0].rawCard).toEqual(summary.card);
      const restoredPlan = createHomeAssistantCardEditorPackagePlan(JSON.parse(JSON.stringify({ editorMode: "expert", fields })));
      const output = createHomeAssistantCardEditorConfiguration(restoredPlan);
      expect(output).toEqual(summary.card);
      expect(summarizeHomeAssistantCardImport(serializeHomeAssistantEntitiesCardConfiguration(output, format)).card).toEqual(summary.card);
      expect(JSON.stringify(summary.card)).toBe(original);
    });
  }
  it("keeps deliberate Entity rename and entity selection working", () => {
    const normalized = summarizeHomeAssistantCardImport(JSON.stringify(entity)).card;
    const fields = editorFields(normalized);
    expect(createHomeAssistantCardEditorConfiguration({ editorMode: "expert", fields: [
      { ...fields[0], id: "New title", entityId: "sensor.new_value" },
    ] })).toEqual({ ...normalized, name: "New title", entity: "sensor.new_value" });
  });
  it.each(["json", "yaml"] as const)("retains standalone conditions, names and styles through %s HACS", format => {
    const normalized = summarizeHomeAssistantCardImport(JSON.stringify({ ...conditional(entity),
      card_mod: { style: "ha-card { --accent-color: red; }" },
    })).card;
    const plan = createHomeAssistantCardEditorPackagePlan({
      editorMode: "expert", cardName: "Single import", scriptFilename: "single-import.js",
      fields: editorFields(normalized),
    });
    const card = createHomeAssistantCardEditorConfiguration(plan);
    const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
      card, format, name: plan.cardName, editorPlan: plan, languages: ["en", "de", "fr"],
    }));
    const read = readHomeAssistantCardEditorHacsBundleArchivePackage(createHomeAssistantCardEditorHacsBundleArchive(bundle).content);
    expect(read.importable, read.reason).toBe(true);
    expect(createHomeAssistantCardEditorHacsBundleReadinessReport(read).ready).toBe(true);
    expect(read.summary?.card).toEqual(normalized);
    expect(createHomeAssistantCardEditorConfiguration(read.summary!.editorPlan!)).toEqual(normalized);
  });
});
