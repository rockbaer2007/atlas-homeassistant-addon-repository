import { describe, expect, it } from "vitest";
import {
  createHomeAssistantCardEditorConfiguration, createHomeAssistantCardEditorHacsBundle,
  createHomeAssistantCardEditorHacsBundleArchive, createHomeAssistantCardEditorHacsBundleReadinessReport,
  createHomeAssistantCardEditorPackagePlan, createHomeAssistantCardExportPackage,
  readHomeAssistantCardEditorHacsBundleArchivePackage,
} from "../src";

function fixture() {
  const plan = createHomeAssistantCardEditorPackagePlan({
    cardName: "Distribution test", scriptFilename: "delivery-test.js", editorMode: "expert",
    fields: [{ id: "Original title", target: "entity", entityId: "sensor.original", column: 1, row: 2, width: 4, height: 2 }],
  });
  const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
    card: createHomeAssistantCardEditorConfiguration(plan), format: "json", name: plan.cardName,
    languages: ["en", "de", "fr"], editorPlan: plan,
  }));
  return { plan, bundle };
}

describe("HACS distribution layout", () => {
  it("rejects the HACS 2.0.5 dist-prefix filename boundary without changing the project", () => {
    const { plan } = fixture();
    const original = JSON.stringify(plan);
    const cardPackage = createHomeAssistantCardExportPackage({
      card: createHomeAssistantCardEditorConfiguration(plan), format: "json", name: plan.cardName,
      editorPlan: { ...plan, scriptFilename: "distribution.js" },
    });
    expect(() => createHomeAssistantCardEditorHacsBundle(cardPackage)).toThrow("HACS 2.0.5");
    expect(JSON.stringify(plan)).toBe(original);
  });
  it("exports one dist runtime with sibling locales and preserves project metadata", () => {
    const { plan, bundle } = fixture();
    expect(bundle.files.filter(file => file.path.endsWith(".js")).map(file => file.path)).toEqual(["dist/delivery-test.js"]);
    expect(bundle.files.filter(file => file.path.endsWith(".json") && file.path.includes("locales/")).map(file => file.path))
      .toEqual(["dist/locales/en.json", "dist/locales/de.json", "dist/locales/fr.json"]);
    const read = readHomeAssistantCardEditorHacsBundleArchivePackage(createHomeAssistantCardEditorHacsBundleArchive(bundle).content);
    expect(read.importable, read.reason).toBe(true);
    expect(read.inspection.files.map(file => file.path)).toContain("dist/delivery-test.js");
    expect(read.summary?.editorPlan?.fields).toEqual(plan.fields);
    expect(createHomeAssistantCardEditorHacsBundleReadinessReport(read).ready).toBe(true);
  });

  it("retains legacy root-layout imports without rewriting their contents", () => {
    const { plan, bundle } = fixture();
    const legacy = { ...bundle, files: bundle.files.map(file => ({ ...file, path: file.path.replace(/^dist\//, "") })) };
    const read = readHomeAssistantCardEditorHacsBundleArchivePackage(createHomeAssistantCardEditorHacsBundleArchive(legacy).content);
    expect(read.importable, read.reason).toBe(true);
    expect(read.summary?.editorPlan?.fields).toEqual(plan.fields);
  });

  it("rejects ambiguous root/dist aliases and unsafe physical archive paths", () => {
    const { bundle } = fixture();
    const script = bundle.files.find(file => file.path.endsWith(".js"))!;
    for (const path of ["delivery-test.js", "dist/../delivery-test.js"]) {
      const read = readHomeAssistantCardEditorHacsBundleArchivePackage(createHomeAssistantCardEditorHacsBundleArchive({
        ...bundle, files: [...bundle.files, { ...script, path }],
      }).content);
      expect(read.importable).toBe(false);
    }
  });
});
