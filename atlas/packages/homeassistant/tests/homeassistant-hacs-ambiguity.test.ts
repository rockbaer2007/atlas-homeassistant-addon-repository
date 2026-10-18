import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import {
  createHomeAssistantCardEditorHacsBundle as bundle,
  createHomeAssistantCardEditorHacsBundleArchive as archive,
  createHomeAssistantCardEditorPackagePlan as plan,
  createHomeAssistantCardExportPackage as pkg,
  createHomeAssistantCardEditorConfiguration as config,
  readHomeAssistantCardEditorHacsBundleArchivePackage as read,
  createHomeAssistantCardEditorHacsBundleReadinessReport as report,
  formatHomeAssistantCardEditorHacsBundlePackageReadinessReviewLines as review,
  type HomeAssistantCardEditorHacsBundle,
} from "../src";

function fixture(format: "json" | "yaml", filename = "ambiguity-a.js") {
  const editorPlan = plan({ cardName: "Ambiguity", scriptFilename: filename, editorMode: "expert",
    fields: [{ id: "Original name", target: "entity", entityId: "sun.sun", column: 0, row: 0, width: 4, height: 2 }] });
  return bundle(pkg({ name: "Ambiguity", format, languages: ["en", "de", "fr"], card: config(editorPlan), editorPlan }));
}
const project = (b: HomeAssistantCardEditorHacsBundle) => b.files.find(f => f.path.startsWith("atlas/"))!;
function changePackage(b: HomeAssistantCardEditorHacsBundle, edit: (value: any) => void) {
  return { ...b, files: b.files.map(f => { if (f !== project(b)) return f;
    const value = JSON.parse(f.content); edit(value); return { ...f, content: JSON.stringify(value) }; }) };
}

// Run the actual shipped file change handler, including the final adoption guard.
const source = readFileSync(new URL("../../../examples/status-demo/app.js", import.meta.url), "utf8");
const parsed = ts.createSourceFile("app.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const handlerSource = parsed.statements.find(n => ts.isExpressionStatement(n)
  && n.getText(parsed).startsWith('importHaCardConfig.addEventListener("change"'))!.getText(parsed);
async function importThroughEditor(bytes: Uint8Array, blockedReport = false) {
  const state = { draft: "original draft", adopted: 0 };
  const importReview = { dataset: {} as Record<string, string>, textContent: "" };
  let change: () => Promise<void> = async () => { throw new Error("No handler registered"); };
  const input = { files: [{ arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) }],
    value: "fixture", addEventListener: (_: string, callback: typeof change) => { change = callback; } };
  runInNewContext(handlerSource, { importHaCardConfig: input, Uint8Array,
    isHacsBundleArchiveFile: () => true, readHomeAssistantCardEditorHacsBundleArchivePackage: read,
    createHomeAssistantCardEditorHacsBundleReadinessReport: blockedReport ? () => ({ ready: false }) : report,
    formatHacsBundlePackageReadReview: (r: ReturnType<typeof read>) => review(r).join("\n"),
    haCardImportReview: importReview, statusMessage: { textContent: "" }, t: (key: string) => key,
    applyHomeAssistantCardImportSummary: () => { state.adopted++; state.draft = "changed"; },
  });
  await change(); return { state, importReview };
}

describe("HACS ambiguity is rejected before Editor adoption", () => {
  for (const format of ["json", "yaml"] as const) {
    it.each(["ambiguity-a.js", "temperature.js", "123-room.js"])(`${format}: retains valid script identities %s`, async filename => {
      const bytes = archive(fixture(format, filename)).content, r = read(bytes);
      expect(r.importable, r.reason).toBe(true); expect(report(r).passed).toBe(112);
      expect(r.summary?.editorPlan?.fields[0]?.id).toBe("Original name");
      expect((await importThroughEditor(bytes)).state.adopted).toBe(1);
    });
    for (const kind of ["second project", "second script", "duplicate project", "root-dist script alias"] as const) {
      for (const reverse of [false, true]) it(`${format}: rejects ${kind}, reverse=${reverse}`, async () => {
        const b = fixture(format), p = project(b), s = b.files.find(f => f.path.endsWith(".js"))!;
        const extra = kind === "second project" ? { ...p, path: "atlas/second.atlas-card.json" }
          : kind === "second script" ? { ...s, path: "dist/second-card.js" }
            : kind === "duplicate project" ? p : { ...s, path: b.scriptFilename };
        const bytes = archive({ ...b, files: reverse ? [extra, ...b.files] : [...b.files, extra] }).content;
        const original = bytes.slice(), r = read(bytes);
        expect(r.importable).toBe(false); expect(r.packageContent).toBeUndefined(); expect(r.summary).toBeUndefined();
        expect(report(r).ready).toBe(false); expect(bytes).toEqual(original);
        const actual = await importThroughEditor(bytes);
        expect(actual.state).toEqual({ draft: "original draft", adopted: 0 });
        expect(actual.importReview.dataset.action).toBe("reject");
      });
    }
    const conflicts: Record<string, (p: any) => void> = {
      "Editor filename": p => { p.editorPlan.scriptFilename = "other-card.js"; },
      "Editor resource": p => { p.editorPlan.resourcePath = "/hacsfiles/atlas/other-card.js"; },
      "package filename": p => { p.script.filename = "other-card.js"; },
      "package resource": p => { p.script.resourcePath = "/hacsfiles/other/other-card.js"; },
      "custom element": p => { p.script.customElementName = "other-card"; },
      "Card type": p => { p.script.cardType = "custom:other-card"; },
      "default type": p => { p.script.defaultConfig.type = "custom:other-card"; },
      "default title readiness": p => { p.script.defaultConfig.title = "Wrong title"; },
    };
    for (const [name, edit] of Object.entries(conflicts)) it(`${format}: refuses ${name} consistently`, async () => {
      const bytes = archive(changePackage(fixture(format), edit)).content, r = read(bytes);
      expect(r.importable, name).toBe(false); expect(report(r).ready).toBe(false);
      const actual = await importThroughEditor(bytes);
      expect(actual.state).toEqual({ draft: "original draft", adopted: 0 });
      expect(actual.importReview.dataset.action).toBe("reject");
    });
    it(`${format}: the Editor independently refuses a blocked readiness result`, async () => {
      const actual = await importThroughEditor(archive(fixture(format)).content, true);
      expect(actual.state).toEqual({ draft: "original draft", adopted: 0 });
      expect(actual.importReview.dataset.action).toBe("reject");
    });
  }
});
