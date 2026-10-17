import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import {
  createHomeAssistantCardEditorConfiguration,
  createHomeAssistantCardEditorFieldFromTemplate,
  parseHomeAssistantEntitiesCardConfiguration,
  serializeHomeAssistantEntitiesCardConfiguration,
} from "../src";

const mushroom = {
  type: "custom:mushroom-template-card" as const,
  entity: "input_boolean.fixture_lamp",
  primary: "\n{{ 'On' if is_state(entity, 'on') else 'Off' }}\n",
  secondary: "State: {{ states(entity) }}",
  icon: "{% if is_state(entity, 'on') %}\n  mdi:lightbulb-on\n{% else %}\n  mdi:lightbulb-off\n{% endif %}",
  color: "{{ 'amber' if is_state(entity, 'on') else 'blue' }}",
  icon_color: "{{ 'orange' if is_state(entity, 'on') else 'grey' }}",
};

function importSingleCard(card: object) {
  const source = readFileSync(new URL("../../../examples/status-demo/app.js", import.meta.url), "utf8");
  const parsed = ts.createSourceFile("app.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const names = new Set(["createExpertFieldsFromImportedCard", "cloneImportedCard"]);
  const functions = parsed.statements.filter(node => ts.isFunctionDeclaration(node) && names.has(node.name!.text))
    .map(node => node.getText(parsed)).join("\n");
  return runInNewContext(functions + "\ncreateExpertFieldsFromImportedCard(card)", {
    card,
    createHomeAssistantCardEditorFieldFromTemplate,
    getSimplePreviewCardEntities: () => [{ entity: mushroom.entity, name: "Fixture lamp" }],
    getSimplePreviewCardTitle: (value: typeof mushroom) => value.primary,
    formatEntityIdAsTitle: () => "Fixture lamp",
  });
}

describe("Mushroom template import preservation", () => {
  it("reads literal YAML blocks with blank lines, indentation and hash text intact", () => {
    const source = [
      "type: custom:mushroom-template-card",
      "entity: input_boolean.fixture_lamp",
      "primary: |+",
      "  First",
      "",
      "    # literal template text",
      "  Last",
      "",
      "icon: >-",
      "  {{ 'mdi:lightbulb-on'",
      "  if is_state(entity, 'on') else 'mdi:lightbulb-off' }}",
      "color: \"{{ 'amber' if is_state(entity, 'on') else 'blue' }}\"",
    ].join("\n");
    const card = parseHomeAssistantEntitiesCardConfiguration(source).card;
    expect(card).toMatchObject({
      primary: "First\n\n  # literal template text\nLast\n\n",
      icon: "{{ 'mdi:lightbulb-on' if is_state(entity, 'on') else 'mdi:lightbulb-off' }}",
      color: mushroom.color,
    });
    expect(parseHomeAssistantEntitiesCardConfiguration(serializeHomeAssistantEntitiesCardConfiguration(card, "yaml")).card).toEqual(card);
  });

  it("rejects malformed YAML instead of silently importing partial data", () => {
    expect(() => parseHomeAssistantEntitiesCardConfiguration("type: custom:mushroom-template-card\nentity: [broken")).toThrow();
  });

  it("retains an initially indented template and line-ending characters on YAML export", () => {
    const card = { ...mushroom, primary: "  {% if true %}\ntext\n  {% endif %}", secondary: "First\r\nSecond\r\n" };
    expect(parseHomeAssistantEntitiesCardConfiguration(serializeHomeAssistantEntitiesCardConfiguration(card, "yaml")).card).toEqual(card);
  });

  it.each(["json", "yaml"] as const)("retains literal text, icon and current/legacy color templates in %s", format => {
    const source = serializeHomeAssistantEntitiesCardConfiguration(mushroom, format);
    expect(parseHomeAssistantEntitiesCardConfiguration(source).card).toEqual(mushroom);
    const stack = { type: "vertical-stack" as const, cards: [mushroom] };
    expect(parseHomeAssistantEntitiesCardConfiguration(serializeHomeAssistantEntitiesCardConfiguration(stack, format)).card).toEqual(stack);
  });

  it.each(["json", "yaml"] as const)("keeps a single %s import as a Mushroom field through generation", format => {
    const card = parseHomeAssistantEntitiesCardConfiguration(serializeHomeAssistantEntitiesCardConfiguration(mushroom, format)).card;
    const fields = importSingleCard(card);
    expect(fields).toHaveLength(1);
    expect(fields[0].target).toBe("mushroom-template");
    expect(fields[0].rawCard).toEqual(mushroom);
    expect(createHomeAssistantCardEditorConfiguration({ editorMode: "expert", fields })).toEqual(mushroom);
    expect(createHomeAssistantCardEditorConfiguration({ editorMode: "expert", fields: [{ ...fields[0], entityId: "input_boolean.other" }] }))
      .toEqual({ ...mushroom, entity: "input_boolean.other" });
  });
});
