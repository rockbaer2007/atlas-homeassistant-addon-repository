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
  version: "0.2.0-alpha.17",
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
      version: "0.2.0-alpha.17",
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
      version: "0.2.0-alpha.17",
      descriptionI18n: {
        de: "Referenz-Plugin",
        en: "Reference plugin",
      },
      dependencies: [{ id: "atlas.runtime", version: "^0.2.0", optional: true }],
    });
    expect(parsed.files).toHaveLength(1);
  });

  it("normalizes the published ATLAS plugin-package envelope", () => {
    const manifest = serializeRuntimePluginInstallManifest(plugin);
    const parsed = parseRuntimePluginInstallPackage({
      kind: "atlas.plugin.package",
      filename: "card-editor.atlas-plugin.json",
      atlas: { type: "plugin-package", schemaVersion: 1 },
      plugin: {
        ...plugin,
        status: "active",
        order: 30,
        entry: "/plugin-assets/card-editor/index.html",
      },
      files: [
        { path: "atlas-plugin.json", content: manifest },
        { path: "README.md", content: "# Plugin" },
        { path: "index.html", content: "<!doctype html>" },
        { path: "app.js", content: "console.log('ready');" },
        { path: "icon.svg", content: "<svg></svg>" },
      ],
    });

    expect(parsed.kind).toBe("atlas.runtime.plugin.install-package");
    expect(parsed.filename).toBe("card-editor.atlas-plugin.json");
    expect(parsed.plugin).toMatchObject({ id: plugin.id, version: plugin.version });
    expect(parsed.files.map(file => [file.path, file.mediaType])).toEqual([
      ["atlas-plugin.json", "application/json"],
      ["README.md", "text/markdown"],
      ["index.html", "text/html"],
      ["app.js", "text/javascript"],
      ["icon.svg", "image/svg+xml"],
    ]);
  });

  it("preserves base64 encoding for binary plugin assets", () => {
    const parsed = parseRuntimePluginInstallPackage({
      kind: "atlas.runtime.plugin.install-package",
      plugin,
      files: [{
        path: "icon.png",
        mediaType: "image/png",
        content: "iVBORw0KGgo=",
        contentEncoding: "base64",
      }],
    });

    expect(parsed.files).toEqual([{
      path: "icon.png",
      mediaType: "image/png",
      content: "iVBORw0KGgo=",
      contentEncoding: "base64",
    }]);
  });

  it("deduplicates identical file paths and rejects conflicting duplicates", () => {
    const readme = { path: "README.md", mediaType: "text/markdown", content: "# Plugin" };
    const parsed = parseRuntimePluginInstallPackage({
      kind: "atlas.runtime.plugin.install-package",
      plugin,
      files: [readme, { ...readme }],
    });

    expect(parsed.files).toEqual([readme]);
    expect(() => parseRuntimePluginInstallPackage({
      kind: "atlas.runtime.plugin.install-package",
      plugin,
      files: [readme, { ...readme, content: "# Different plugin" }],
    })).toThrow("Runtime plugin package contains conflicting duplicate file paths: README.md.");
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
    expect(() => parseRuntimePluginInstallPackage({
      kind: "atlas.plugin.package",
      atlas: { type: "plugin-package", schemaVersion: 2 },
      plugin,
      files: [],
    })).toThrow("ATLAS plugin package schema is invalid.");
  });
});
