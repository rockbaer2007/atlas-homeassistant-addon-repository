import { describe, expect, it } from "vitest";
import { crc32 } from "node:zlib";
import {
  createHomeAssistantCardEditorHacsBundle, createHomeAssistantCardEditorHacsBundleArchive,
  createHomeAssistantCardEditorHacsBundleReadinessReport, createHomeAssistantCardExportPackage,
  createHomeAssistantCardEditorPackagePlan, type HomeAssistantCardConfiguration,
  inspectHomeAssistantCardEditorHacsBundleArchive, readHomeAssistantCardEditorHacsBundleArchivePackage,
  createHomeAssistantCardEditorHacsBundleReadinessOverview,
  formatHomeAssistantCardEditorHacsBundlePackageReadinessReviewLines,
} from "../src";

function fixture(format: "json" | "yaml") {
  const card: HomeAssistantCardConfiguration = { type: "vertical-stack", cards: [
      { type: "entity", entity: "sun.sun", name: "" },
      { type: "conditional", conditions: [{ condition: "screen", media_query: "(min-width: 0px)" }],
        card: { type: "entity", entity: "sun.sun", name: "  Literal name  " } },
    ] };
  const editorPlan = createHomeAssistantCardEditorPackagePlan({
    cardName: "CRC fixture", scriptFilename: "crc-fixture.js", editorMode: "expert",
    fields: [{ id: "Imported stack", target: "entity", entityId: "sun.sun", rawCard: card,
      column: 0, row: 0, width: 4, height: 4 }],
  });
  const bundle = createHomeAssistantCardEditorHacsBundle(createHomeAssistantCardExportPackage({
    name: "CRC fixture", format, languages: ["en", "de", "fr"], card, editorPlan,
  }));
  return createHomeAssistantCardEditorHacsBundleArchive({ ...bundle,
    files: [...bundle.files, { path: "extra.txt", mimeType: "text/markdown", content: "Unreferenced extra file" }],
  }).content;
}

// Independent ZIP field decoding and native zlib CRC; never use the reader or
// exporter checksum helper to establish the expected integrity of a fixture.
function fields(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.length);
  const end = bytes.length - 22;
  let central = view.getUint32(end + 16, true);
  const entries = [];
  for (let i = 0; i < view.getUint16(end + 10, true); i++) {
    const local = view.getUint32(central + 42, true), size = view.getUint32(central + 24, true);
    const nameLength = view.getUint16(central + 28, true);
    const name = new TextDecoder().decode(bytes.subarray(central + 46, central + 46 + nameLength));
    const data = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    entries.push({ name, central, local, data, size });
    central += 46 + nameLength + view.getUint16(central + 30, true) + view.getUint16(central + 32, true);
  }
  return { view, end, entries };
}

function rejects(bytes: Uint8Array, reason?: RegExp) {
  const original = bytes.slice();
  const read = readHomeAssistantCardEditorHacsBundleArchivePackage(bytes);
  expect(read.importable).toBe(false);
  expect(read.packageContent).toBeUndefined();
  const report = createHomeAssistantCardEditorHacsBundleReadinessReport(read);
  expect(report.ready).toBe(false);
  expect(report.failed).toBeGreaterThan(0);
  if (reason) expect(read.reason).toMatch(reason);
  if (read.inspection.zipStatus !== "verified") {
    expect(read.inspection.missingFiles).toEqual([]);
    expect(read.inspection.missingLocaleFiles).toEqual([]);
    expect(read.inspection.issues).toHaveLength(1);
    expect(read.inspection.issues[0]!.code).toMatch(/^(zip-integrity|unreadable-zip)$/);
    expect(report.checks[0]).toMatchObject({ code: "zip-readable", status: "fail", detail: read.reason });
    for (const check of report.checks) {
      if (check.code === "zip-readable" || check.code === "bundle-importable"
        || check.code.startsWith("import-report-")) continue;
      expect(check.status, check.code).toBe("pending");
      expect(check.detail).toContain("Not checked because ZIP verification failed");
    }
    expect(createHomeAssistantCardEditorHacsBundleReadinessOverview(read).firstFailedCheck?.code).toBe("zip-readable");
    expect(formatHomeAssistantCardEditorHacsBundlePackageReadinessReviewLines(read).join("\n"))
      .not.toMatch(/missing-required-file|missing-locale-file|Missing files:|Missing locales:/);
  }
  expect(bytes).toEqual(original);
}

describe("HACS stored ZIP integrity before package adoption", () => {
  for (const format of ["json", "yaml"] as const) {
    it(`${format}: reports an unreadable archive without inventing absent files`, () => {
      rejects(new Uint8Array([1, 2, 3]), /not a readable ZIP/);
    });
    it(`${format}: accepts valid ZIPs with independent CRC verification and literal names`, () => {
      const bytes = fixture(format), { view, entries } = fields(bytes);
      for (const e of entries) expect(crc32(bytes.subarray(e.data, e.data + e.size))).toBe(view.getUint32(e.central + 16, true));
      const read = readHomeAssistantCardEditorHacsBundleArchivePackage(bytes);
      expect(createHomeAssistantCardEditorHacsBundleReadinessReport(read).passed).toBe(112);
      expect(read.summary?.card).toMatchObject({ cards: [
        { name: "" }, { card: { name: "  Literal name  " } },
      ] });
    });

    for (const index of Array.from({ length: 9 }, (_, i) => i)) {
      it(`${format}: rejects independently CRC-damaged entry ${index}, including extra files`, () => {
        const bytes = fixture(format), { view, entries } = fields(bytes), e = entries[index]!;
        expect(e.size).toBeGreaterThan(0);
        bytes[e.data] = bytes[e.data]! ^ 1;
        expect(crc32(bytes.subarray(e.data, e.data + e.size))).not.toBe(view.getUint32(e.central + 16, true));
        expect(inspectHomeAssistantCardEditorHacsBundleArchive(bytes).importable).toBe(false);
        rejects(bytes, /CRC32/);
      });
    }

    const mutations: Record<string, (f: ReturnType<typeof fields>, bytes: Uint8Array) => void> = {
      "local CRC": ({ view, entries }) => view.setUint32(entries[0]!.local + 14, 0, true),
      "central CRC": ({ view, entries }) => view.setUint32(entries[0]!.central + 16, 0, true),
      "matching but wrong CRCs": ({ view, entries }) => {
        view.setUint32(entries[0]!.local + 14, 0, true); view.setUint32(entries[0]!.central + 16, 0, true);
      },
      "local filename": ({ entries }, bytes) => { bytes[entries[0]!.local + 30] = 0x78; },
      "local size": ({ view, entries }) => view.setUint32(entries[0]!.local + 22, 1, true),
      "central size": ({ view, entries }) => view.setUint32(entries[0]!.central + 24, 1, true),
      "local offset": ({ view, entries }) => view.setUint32(entries[0]!.central + 42, entries[0]!.data, true),
      "central bounds": ({ view, end }) => view.setUint32(end + 16, 0xfffffff0, true),
      "directory size": ({ view, end }) => view.setUint32(end + 12, 1, true),
      "directory count": ({ view, end }) => {
        view.setUint16(end + 8, 1, true); view.setUint16(end + 10, 1, true);
      },
      "multi-disk": ({ view, end }) => view.setUint16(end + 4, 1, true),
      "ZIP64": ({ view, end }) => view.setUint32(end + 16, 0xffffffff, true),
      "data descriptor": ({ view, entries }) => {
        view.setUint16(entries[0]!.central + 8, 8, true); view.setUint16(entries[0]!.local + 6, 8, true);
      },
      "encryption": ({ view, entries }) => {
        view.setUint16(entries[0]!.central + 8, 1, true); view.setUint16(entries[0]!.local + 6, 1, true);
      },
      "unchecked compressed extra": ({ view, entries }) => {
        const e = entries.at(-1)!; view.setUint16(e.central + 10, 8, true); view.setUint16(e.local + 8, 8, true);
      },
    };
    for (const [name, mutate] of Object.entries(mutations)) {
      it(`${format}: refuses ${name} before exposing package content`, () => {
        const bytes = fixture(format); mutate(fields(bytes), bytes); rejects(bytes);
      });
    }

    it(`${format}: accepts a proper ZIP comment but rejects undeclared trailing/truncated bytes`, () => {
      const source = fixture(format), commented = new Uint8Array(source.length + 4);
      commented.set(source); commented.set([84, 101, 115, 116], source.length);
      new DataView(commented.buffer).setUint16(source.length - 2, 4, true);
      expect(readHomeAssistantCardEditorHacsBundleArchivePackage(commented).importable).toBe(true);
      const trailing = new Uint8Array(source.length + 1); trailing.set(source);
      rejects(trailing); rejects(source.subarray(0, source.length - 1));
    });
  }
});
