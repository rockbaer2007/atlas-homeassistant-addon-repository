import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { cardEditorFrenchTranslations } from "../../../examples/status-demo/card-editor-fr.js";

describe("Home Assistant card editor French locale", () => {
  it("covers every English UI message and preserves interpolation variables", async () => {
    const source = (await readFile(new URL("../../../examples/status-demo/app.js", import.meta.url), "utf8"))
      .replace(/\r\n/g, "\n");
    const englishSection = source
      .split("const translations = {\n  en: {")[1]
      ?.split("\n  },\n  de: {")[0];
    expect(englishSection).toBeTruthy();

    const englishEntries = [...englishSection!.matchAll(
      /^    ("(?:\\.|[^"\\])*"): ("(?:\\.|[^"\\])*")(?:,)?$/gm,
    )].map(([, key, value]) => [JSON.parse(key!), JSON.parse(value!)] as const);
    expect(Object.keys(cardEditorFrenchTranslations).sort())
      .toEqual(englishEntries.map(([key]) => key).sort());

    const variables = (value: string) => [...value.matchAll(/\{([^{}]+)\}/g)]
      .map((match) => match[1])
      .sort();
    for (const [key, english] of englishEntries) {
      expect(variables(cardEditorFrenchTranslations[key])).toEqual(variables(english));
    }
  });

  it("keeps the shared Plugin Hub label and supplies French navigation copy", () => {
    expect(cardEditorFrenchTranslations["link.openHub"]).toBe("Plugin Hub");
    expect(cardEditorFrenchTranslations["aria.language"]).toBe("Langue");
  });
});
