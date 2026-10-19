import { describe, expect, it } from "vitest";
import {
  HACS_IMPORT_LIMITS as limits,
  createHomeAssistantCardEditorHacsBundle as bundle,
  createHomeAssistantCardEditorHacsBundleArchive as archive,
  createHomeAssistantCardEditorPackagePlan as plan,
  createHomeAssistantCardExportPackage as pkg,
  createHomeAssistantCardEditorConfiguration as config,
  readHomeAssistantCardEditorHacsBundleArchivePackage as read,
  createHomeAssistantCardEditorHacsBundleReadinessReport as report,
} from "../src";

const editorPlan = plan({ cardName: "Limits", scriptFilename: "limits-card.js", editorMode: "expert",
  fields: [{ id: "Name", target: "entity", entityId: "sun.sun", column: 0, row: 0, width: 4, height: 2 }] });
const base = bundle(pkg({ name: "Limits", format: "json", languages: ["en"], card: config(editorPlan), editorPlan }));
const asset = (path: string, size: number) => ({ path, mimeType: "text/markdown" as const, content: "x".repeat(size) });
const make = (extra: ReturnType<typeof asset>[]) => archive({ ...base, files: [...base.files, ...extra] }).content;
function limited(bytes: Uint8Array) {
  const r = read(bytes); expect(r.importable).toBe(false); expect(r.summary).toBeUndefined();
  expect(r.inspection.zipStatus).toBe("limit-exceeded");
  expect(r.inspection.issues[0]?.code).toBe("archive-limit");
  expect(r.inspection.missingFiles).toEqual([]); expect(report(r).ready).toBe(false);
}
describe("HACS import budgets before content validation", () => {
  it("rejects an oversized archive before attempting ZIP parsing", () => limited(new Uint8Array(limits.archiveBytes + 1)));
  it("accepts the entry-count boundary and rejects one extra entry", () => {
    const extras = Array.from({ length: limits.entries - base.files.length }, (_, i) => asset(`assets/${i}.txt`, 0));
    expect(read(make(extras)).importable).toBe(true); limited(make([...extras, asset("assets/extra.txt", 0)]));
  });
  it("accepts exactly 8 MiB per entry and rejects one byte more", () => {
    expect(read(make([asset("assets/padding.txt", limits.entryBytes)])).importable).toBe(true);
    limited(make([asset("assets/padding.txt", limits.entryBytes + 1)]));
  }, 15000);
  it("accepts exactly 24 MiB total and rejects one byte more before CRC", () => {
    const baseSize = base.files.reduce((n, f) => n + new TextEncoder().encode(f.content).length, 0);
    const remaining = limits.totalBytes - baseSize;
    const extra = [asset("assets/one.txt", limits.entryBytes), asset("assets/two.txt", limits.entryBytes),
      asset("assets/three.txt", remaining - 2 * limits.entryBytes)];
    expect(read(make(extra)).importable).toBe(true);
    const bytes = make([...extra, asset("assets/extra.txt", 1)]);
    // Corrupt first stored payload; the later metadata limit must still win.
    const header = new DataView(bytes.buffer); bytes[30 + header.getUint16(26, true) + header.getUint16(28, true)]! ^= 1;
    limited(bytes);
  }, 15000);
  it("bounds UTF-8 path bytes, not only character count", () => {
    expect(read(make([asset("a".repeat(limits.pathBytes), 0)])).importable).toBe(true);
    limited(make([asset("a".repeat(limits.pathBytes + 1), 0)]));
    limited(make([asset("ä".repeat(513), 0)]));
  });
  it("limits declared expanded sizes even for unsupported compressed entries", () => {
    const bytes = make([]), view = new DataView(bytes.buffer);
    const directory = view.getUint32(bytes.length - 6, true);
    const local = view.getUint32(directory + 42, true);
    view.setUint16(directory + 10, 8, true); view.setUint16(local + 8, 8, true);
    view.setUint32(directory + 24, 0xfffffffe, true); view.setUint32(local + 22, 0xfffffffe, true);
    limited(bytes);
  });
});
