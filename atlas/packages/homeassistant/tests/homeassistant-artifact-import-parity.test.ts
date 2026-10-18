import { describe, expect, it } from "vitest";
import { stringify } from "yaml";
import {
  createHomeAssistantCardExportPackage, decideHomeAssistantCardArtifactImport,
  inspectHomeAssistantCardArtifact, summarizeHomeAssistantCardImport,
} from "../src";

const entity = { type: "entity", entity: "sensor.example", name: "Example" };
const markdown = { type: "markdown", content: "# Keep this text\n{{ states('sensor.example') }}" };
const conditional = (card: unknown) => ({
  type: "conditional", conditions: [{ condition: "state", entity: "sensor.example", state: "on" }], card,
});
const wrappers = [
  (card: unknown) => card,
  (card: unknown) => ({ type: "vertical-stack", cards: [entity, conditional(card)] }),
  (card: unknown) => ({ type: "horizontal-stack", cards: [card] }),
  (card: unknown) => ({ type: "grid", columns: 2, cards: [card] }),
  conditional,
  (card: unknown) => ({ type: "custom:tabbed-card-v2", tabs: [{ attributes: { label: "Test" }, card }] }),
];

describe("artifact preview uses the actual import parser", () => {
  for (const format of ["json", "yaml"] as const) {
    const encode = format === "json" ? JSON.stringify : stringify;
    it.each(wrappers)(`rejects unsupported Markdown at every supported depth in ${format}`, wrap => {
      const source = encode(wrap(markdown));
      const pkg = createHomeAssistantCardExportPackage({
        card: summarizeHomeAssistantCardImport(JSON.stringify(entity)).card, format, name: "Parity",
      });
      for (const text of [source, JSON.stringify({ ...pkg, content: source }),
        JSON.stringify({ manifest: { name: "Parity", filename: `parity.${format}`, format }, content: source })]) {
        expect(() => summarizeHomeAssistantCardImport(text)).toThrow();
        expect(inspectHomeAssistantCardArtifact(text)).toMatchObject({ importable: false, requiresReview: true });
        expect(decideHomeAssistantCardArtifactImport(text).action).toBe("reject");
      }
    });
    it.each(wrappers)(`accepts supported Entity cards at the same depths in ${format}`, wrap => {
      const text = encode(wrap(entity));
      expect(() => summarizeHomeAssistantCardImport(text)).not.toThrow();
      expect(decideHomeAssistantCardArtifactImport(text).action).toBe("import");
    });
    it(`rejects invalid nested numeric bounds in ${format}`, () => {
      const text = encode({ type: "vertical-stack", cards: [{
        type: "conditional", conditions: [{ condition: "numeric_state", entity: "sensor.example" }], card: entity,
      }] });
      expect(() => summarizeHomeAssistantCardImport(text)).toThrow(/numeric_state/);
      expect(inspectHomeAssistantCardArtifact(text).importable).toBe(false);
    });
  }
  it("does not mistake a type key inside a YAML string for a root card", () => {
    const text = 'description: |\n  type: entities\n  entities: []\n';
    expect(inspectHomeAssistantCardArtifact(text).importable).toBe(false);
  });
});
