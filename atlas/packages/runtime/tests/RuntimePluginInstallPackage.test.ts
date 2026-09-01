import { describe, expect, it } from "vitest";

import {
  createRuntimePluginInstallPackage,
  normalizeRuntimePluginPackageName,
  parseRuntimePluginInstallPackage,
  serializeRuntimePluginInstallManifest,
  type RuntimePluginDescriptor,
} from "../src";

const plugin: RuntimePluginDescriptor = {
  id: "atlas.plugin.homeassistant-card-editor",
  name: "ATLAS Home Assistant Card Editor",
  nameI18n: {
    de: "ATLAS Home Assistant Karten-Editor",
    en: "ATLAS Home Assistant Card Editor",
  },
  version: "0.2.0-alpha.11",
  description: "Reference plugin",
  descriptionI18n: {
    de: "Referenz-Plugin",
    en: "Reference plugin",
  },
  icon: "icon.svg",
  logo: "logo.svg",
  preview: "preview.svg",
  dependencies: [],
  extensionPoints: ["homeassistant.card-editor"],
  provides: ["homeassistant.expert-editor"],
};

describe("RuntimePluginInstallPackage", () => {
  it("serializes a plugin install manifest", () => {
    expect(JSON.parse(serializeRuntimePluginInstallManifest(plugin))).toEqual({
      id: "atlas.plugin.homeassistant-card-editor",
      name: "ATLAS Home Assistant Card Editor",
      nameI18n: {
        de: "ATLAS Home Assistant Karten-Editor",
        en: "ATLAS Home Assistant Card Editor",
      },
      version: "0.2.0-alpha.11",
      description: "Reference plugin",
      descriptionI18n: {
        de: "Referenz-Plugin",
        en: "Reference plugin",
      },
      icon: "icon.svg",
      logo: "logo.svg",
      preview: "preview.svg",
      dependencies: [],
      extensionPoints: ["homeassistant.card-editor"],
      provides: ["homeassistant.expert-editor"],
    });
  });

  it("creates a package with manifest, README and custom files", () => {
    const installPackage = createRuntimePluginInstallPackage({
      plugin,
      files: [{
        path: "examples/card.yaml",
        mediaType: "application/yaml",
        content: "type: entities\n",
      }],
    });

    expect(installPackage).toMatchObject({
      kind: "atlas.runtime.plugin.install-package",
      filename: "atlas-plugin-homeassistant-card-editor.atlas-plugin.json",
      plugin,
    });
    expect(installPackage.files.map(file => file.path)).toEqual([
      "atlas-plugin.json",
      "README.md",
      "examples/card.yaml",
    ]);
    expect(installPackage.files[1]?.content).toContain("# ATLAS Home Assistant Card Editor");
  });

  it("normalizes package names", () => {
    expect(normalizeRuntimePluginPackageName(" ATLAS Plugin: Home Assistant Card Editor! "))
      .toBe("atlas-plugin-home-assistant-card-editor");
    expect(normalizeRuntimePluginPackageName(" ")).toBe("atlas-plugin");
  });

  it("parses an install package without executing plugin code", () => {
    const parsed = parseRuntimePluginInstallPackage(JSON.stringify({
      kind: "atlas.runtime.plugin.install-package",
      filename: "atlas-plugin-homeassistant-card-editor.atlas-plugin.json",
      plugin: {
        ...plugin,
        dependencies: [{ id: "atlas.runtime", version: "^0.2.0", optional: true }],
      },
      files: [{
        path: "atlas-plugin.json",
        mediaType: "application/json",
        content: serializeRuntimePluginInstallManifest(plugin),
      }],
    }));

    expect(parsed.plugin).toMatchObject({
      id: "atlas.plugin.homeassistant-card-editor",
      name: "ATLAS Home Assistant Card Editor",
      nameI18n: {
        de: "ATLAS Home Assistant Karten-Editor",
        en: "ATLAS Home Assistant Card Editor",
      },
      version: "0.2.0-alpha.11",
      descriptionI18n: {
        de: "Referenz-Plugin",
        en: "Reference plugin",
      },
      dependencies: [{ id: "atlas.runtime", version: "^0.2.0", optional: true }],
    });
    expect(parsed.files).toHaveLength(1);
  });

  it("rejects invalid install packages", () => {
    expect(() => parseRuntimePluginInstallPackage("{")).toThrow(
      "Runtime plugin install package JSON is invalid.",
    );
    expect(() => parseRuntimePluginInstallPackage({
      kind: "atlas.runtime.plugin.install-package",
      plugin: { name: "Missing id", version: "1.0.0" },
    })).toThrow("Runtime plugin id is required.");
    expect(() => parseRuntimePluginInstallPackage({
      kind: "other",
      plugin,
    })).toThrow("Runtime plugin install package kind is invalid.");
  });
});
