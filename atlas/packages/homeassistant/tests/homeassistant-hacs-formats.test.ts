import { describe, expect, it } from "vitest";
import {
  createHomeAssistantCardEditorConfiguration, createHomeAssistantCardEditorHacsBundle,
  createHomeAssistantCardEditorHacsBundleArchive, createHomeAssistantCardEditorHacsBundleReadinessReport,
  createHomeAssistantCardEditorPackagePlan, createHomeAssistantCardExportPackage,
  readHomeAssistantCardEditorHacsBundleArchivePackage,
} from "../src";

const mushroom = {
  type: "custom:mushroom-template-card" as const, entity: "input_boolean.fixture_lamp",
  primary: "\n{% if is_state(entity, 'on') %}\nOn\n{% else %}\nOff\n{% endif %}\n",
  secondary: "{{ states(entity) }}", icon: "{{ 'mdi:lightbulb-on' if is_state(entity, 'on') else 'mdi:lightbulb-off' }}",
  color: "{{ 'amber' if is_state(entity, 'on') else 'blue' }}",
};
const plan = createHomeAssistantCardEditorPackagePlan({
  cardName: "HACS formats", scriptFilename: "hacs-formats.js", editorMode: "expert",
  fields: [{ id: "Template", target: "mushroom-template", entityId: mushroom.entity,
    rawCard: mushroom, column: 0, row: 0, width: 4, height: 2 }],
});
function fixture(format: "json" | "yaml") {
  const pkg = createHomeAssistantCardExportPackage({ card: mushroom, format, name: plan.cardName,
    editorPlan: plan, languages: ["en", "de", "fr"] });
  return { pkg, bundle: createHomeAssistantCardEditorHacsBundle(pkg) };
}
function read(bundle: ReturnType<typeof createHomeAssistantCardEditorHacsBundle>) {
  return readHomeAssistantCardEditorHacsBundleArchivePackage(createHomeAssistantCardEditorHacsBundleArchive(bundle).content);
}

describe("HACS package format parity", () => {
  it.each(["json", "yaml"] as const)("accepts %s through export, readiness, import and byte-identical re-export", format => {
    const { pkg, bundle } = fixture(format), imported = read(bundle);
    expect(imported.importable, imported.reason).toBe(true);
    expect(imported.summary?.format).toBe(format);
    expect(imported.summary?.card).toEqual(mushroom);
    expect(imported.summary?.editorPlan?.fields).toEqual(plan.fields);
    expect(createHomeAssistantCardEditorConfiguration(imported.summary!.editorPlan!)).toEqual(mushroom);
    const report = createHomeAssistantCardEditorHacsBundleReadinessReport(imported);
    expect(report.checks.filter(check => check.status !== "pass")).toEqual([]);
    expect(report.ready).toBe(true);
    expect(report.checks.find(check => check.code === "package-format-supported")?.status).toBe("pass");
    const embedded = JSON.parse(imported.packageContent!);
    expect(imported.packageFile).toMatch(/\.atlas-card\.json$/);
    expect(embedded.manifest.format).toBe(format);
    expect(embedded.manifest.filename).toMatch(new RegExp("\\." + format + "$"));
    expect(embedded.content).toBe(pkg.content);
    expect(createHomeAssistantCardEditorHacsBundleArchive(createHomeAssistantCardEditorHacsBundle(embedded)).content)
      .toEqual(createHomeAssistantCardEditorHacsBundleArchive(bundle).content);
  });

  it("keeps the runtime and language files independent of the selected source format", () => {
    const runtime = (format: "json" | "yaml") => fixture(format).bundle.files.filter(file => file.path.startsWith("dist/"));
    expect(runtime("yaml")).toEqual(runtime("json"));
  });

  it.each(["json", "yaml"] as const)("still rejects malformed %s content and missing locales", format => {
    const { bundle } = fixture(format);
    const malformed = { ...bundle, files: bundle.files.map(file => {
      if (!file.path.endsWith(".atlas-card.json")) return file;
      const pkg = JSON.parse(file.content); pkg.content = "type: [broken";
      return { ...file, content: JSON.stringify(pkg) };
    }) };
    for (const rejected of [malformed, { ...bundle, files: bundle.files.filter(file => file.path !== "dist/locales/fr.json") }]) {
      const imported = read(rejected);
      expect(imported.importable).toBe(false);
      expect(createHomeAssistantCardEditorHacsBundleReadinessReport(imported).ready).toBe(false);
    }
  });
});
