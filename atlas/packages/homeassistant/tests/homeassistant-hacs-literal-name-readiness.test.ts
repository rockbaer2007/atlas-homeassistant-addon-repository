import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import {
  createHomeAssistantCardEditorConfiguration, createHomeAssistantCardEditorPackagePlan,
  createHomeAssistantCardEditorFieldFromTemplate,
  createHomeAssistantCardExportPackage, createHomeAssistantCardEditorHacsBundle,
  createHomeAssistantCardEditorHacsBundleArchive, readHomeAssistantCardEditorHacsBundleArchivePackage,
  createHomeAssistantCardEditorHacsBundleReadinessReport,
  type HomeAssistantCardConfiguration,
} from "../src";

function editorFields(card: HomeAssistantCardConfiguration) {
  const source = readFileSync(new URL("../../../examples/status-demo/app.js", import.meta.url), "utf8");
  const parsed = ts.createSourceFile("app.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const names = new Set(["createExpertFieldsFromImportedCard", "cloneImportedCard",
    "getSimplePreviewCardEntities", "collectSimplePreviewCardEntities", "getSimplePreviewCardTitle", "getImportedCardTarget"]);
  const functions = parsed.statements.filter(node => ts.isFunctionDeclaration(node) && names.has(node.name!.text))
    .map(node => node.getText(parsed)).join("\n");
  return runInNewContext(functions + "\ncreateExpertFieldsFromImportedCard(card)", {
    card, createHomeAssistantCardEditorFieldFromTemplate, formatEntityIdAsTitle: () => "Derived label",
  });
}

function fixture(name: string, kind: "entity" | "stack" | "conditional", format: "json" | "yaml") {
  const leaf = { type: "entity" as const, entity: "sun.sun", name };
  const card: HomeAssistantCardConfiguration = kind === "entity" ? leaf : kind === "stack"
    ? { type: "vertical-stack", cards: [leaf, { ...leaf, name: "Other name" }] }
    : { type: "conditional", conditions: [{ condition: "screen", media_query: "(min-width: 0px)" }], card: leaf };
  const plan = createHomeAssistantCardEditorPackagePlan({
    cardName: "Explicit HACS package name", scriptFilename: "literal-title-test.js", editorMode: "expert",
    fields: card.type === "vertical-stack" ? [{ id: "Imported stack", target: "entity",
      entityId: leaf.entity, rawCard: card, layout: "vertical-stack", column: 0, row: 0, width: 4, height: 4,
      entries: card.cards.map(rawCard => ({ id: "Entry", target: "entity", entityId: leaf.entity, rawCard })),
    }] : editorFields(card),
  });
  const output = createHomeAssistantCardEditorConfiguration(plan);
  const pkg = createHomeAssistantCardExportPackage({ card: output, format, name: plan.cardName, editorPlan: plan });
  return { bundle: createHomeAssistantCardEditorHacsBundle(pkg), output };
}
function read(bundle: ReturnType<typeof createHomeAssistantCardEditorHacsBundle>) {
  return readHomeAssistantCardEditorHacsBundleArchivePackage(createHomeAssistantCardEditorHacsBundleArchive(bundle).content);
}

describe("HACS readiness uses package identity rather than the first Entity label", () => {
  for (const format of ["json", "yaml"] as const) for (const kind of ["entity", "stack", "conditional"] as const) {
    it.each(["", " ", "  Literal name  ", "\tKüche\t"])(`${format} ${kind} retains the literal name and passes all checks: %j`, name => {
      const { bundle, output } = fixture(name, kind, format);
      const bytes = createHomeAssistantCardEditorHacsBundleArchive(bundle).content;
      const imported = read(bundle), original = JSON.stringify(imported);
      expect(imported.importable, imported.reason).toBe(true);
      const report = createHomeAssistantCardEditorHacsBundleReadinessReport(imported);
      expect(report.ready).toBe(true);
      expect(report.passed).toBe(112);
      expect(report.checks.find(check => check.code === "package-title-present")?.detail).toContain("Explicit HACS package name");
      expect(report.checks.find(check => check.code === "import-summary-title-present")?.detail).toContain("Explicit HACS package name");
      expect(JSON.stringify(imported)).toBe(original);
      expect(createHomeAssistantCardEditorConfiguration(imported.summary!.editorPlan!)).toEqual(output);
      expect(createHomeAssistantCardEditorHacsBundleArchive(createHomeAssistantCardEditorHacsBundle(JSON.parse(imported.packageContent!))).content).toEqual(bytes);
      // Keep the source name assertion independent of any summary title fallback.
      const card = imported.summary!.card;
      const first = card.type === "vertical-stack" ? card.cards[0] : card.type === "conditional" ? card.card : card;
      expect("name" in first && first.name).toBe(name);
    });
  }
  it.each(["", " ", "Different package"])("still rejects a missing or mismatched manifest name: %j", name => {
    const { bundle } = fixture("", "entity", "json");
    const changed = { ...bundle, files: bundle.files.map(file => file.path === "hacs.json"
      ? { ...file, content: JSON.stringify({ ...JSON.parse(file.content), name }) } : file) };
    const imported = read(changed);
    expect(imported.importable).toBe(false);
    expect(createHomeAssistantCardEditorHacsBundleReadinessReport(imported).ready).toBe(false);
  });
  it("does not invent a title when no package or display title is available", () => {
    const imported = read(fixture("", "entity", "json").bundle);
    const { editorPlan: ignored, ...summary } = imported.summary!;
    const report = createHomeAssistantCardEditorHacsBundleReadinessReport({ ...imported, hacsMetadata: undefined, summary });
    expect(report.ready).toBe(false);
    for (const code of ["package-title-present", "import-summary-title-present"]) {
      expect(report.checks.find(check => check.code === code)?.status).toBe("fail");
    }
  });
});
