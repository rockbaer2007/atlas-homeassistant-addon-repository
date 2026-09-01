import { describe, expect, it } from "vitest";

import type { Application } from "@atlas/kernel";

import {
  describeRuntimePlugin,
  RuntimeHost,
  RuntimePluginCatalog,
  type RuntimePlugin,
  type RuntimePluginDescriptor,
} from "../src";

const application: Application = {
  name: "plugin-catalog-runtime",
  version: {
    major: 0,
    minor: 2,
    patch: 0,
  },
};

describe("RuntimePluginCatalog", () => {
  it("describes plugin discovery metadata without exposing mutable arrays", () => {
    const plugin: RuntimePlugin = {
      manifest: {
        id: "atlas.plugin.catalog",
        name: "Catalog plugin",
        nameI18n: {
          de: "Katalog-Plugin",
          en: "Catalog plugin",
        },
        version: "1.0.0",
        description: "Discovery metadata",
        descriptionI18n: {
          de: "Erkennungsmetadaten",
          en: "Discovery metadata",
        },
        icon: "icon.svg",
        logo: "logo.svg",
        preview: "preview.svg",
        dependencies: [{ id: "atlas.plugin.base", version: "^1.0.0" }],
        extensionPoints: ["homeassistant.card-target"],
        provides: ["catalog-card"],
      },
      async activate() {},
    };

    const descriptor: RuntimePluginDescriptor = describeRuntimePlugin(plugin);

    expect(descriptor).toEqual({
      id: "atlas.plugin.catalog",
      name: "Catalog plugin",
      nameI18n: {
        de: "Katalog-Plugin",
        en: "Catalog plugin",
      },
      version: "1.0.0",
      description: "Discovery metadata",
      descriptionI18n: {
        de: "Erkennungsmetadaten",
        en: "Discovery metadata",
      },
      icon: "icon.svg",
      logo: "logo.svg",
      preview: "preview.svg",
      dependencies: [{ id: "atlas.plugin.base", version: "^1.0.0" }],
      extensionPoints: ["homeassistant.card-target"],
      provides: ["catalog-card"],
    });
    expect(descriptor.dependencies).not.toBe(plugin.manifest.dependencies);
    expect(descriptor.extensionPoints).not.toBe(plugin.manifest.extensionPoints);
    expect(descriptor.provides).not.toBe(plugin.manifest.provides);
  });

  it("finds registered plugins by extension point and provided capability", () => {
    const catalog = new RuntimePluginCatalog();

    catalog.register({
      manifest: {
        id: "atlas.plugin.homeassistant",
        name: "Home Assistant plugin",
        version: "1.0.0",
        extensionPoints: ["homeassistant.card-target", "homeassistant.resource-check"],
        provides: ["bubble-card-target"],
      },
      async activate() {},
    });
    catalog.register({
      manifest: {
        id: "atlas.plugin.devtools",
        name: "Devtools plugin",
        version: "1.0.0",
        extensionPoints: ["devtools.panel"],
        provides: ["plugin-inspector"],
      },
      async activate() {},
    });

    expect(catalog.list().map(plugin => plugin.id)).toEqual([
      "atlas.plugin.homeassistant",
      "atlas.plugin.devtools",
    ]);
    expect(catalog.findByExtensionPoint("homeassistant.card-target").map(plugin => plugin.id))
      .toEqual(["atlas.plugin.homeassistant"]);
    expect(catalog.findProviding("plugin-inspector").map(plugin => plugin.id))
      .toEqual(["atlas.plugin.devtools"]);
  });

  it("rejects duplicate plugin ids", () => {
    const catalog = new RuntimePluginCatalog();
    const plugin: RuntimePlugin = {
      manifest: {
        id: "atlas.plugin.duplicate",
        name: "Duplicate plugin",
        version: "1.0.0",
      },
      async activate() {},
    };

    catalog.register(plugin);

    expect(() => catalog.register(plugin)).toThrow(
      "Runtime plugin already registered: atlas.plugin.duplicate",
    );
  });

  it("converts catalog entries into runtime modules", async () => {
    const calls: string[] = [];
    const catalog = new RuntimePluginCatalog();

    catalog.register({
      manifest: {
        id: "atlas.plugin.module-one",
        name: "Module one",
        version: "1.0.0",
      },
      async activate() {
        calls.push("one");
      },
    });
    catalog.register({
      manifest: {
        id: "atlas.plugin.module-two",
        name: "Module two",
        version: "1.0.0",
        dependencies: [{ id: "atlas.plugin.module-one", version: "1.0.0" }],
      },
      async activate() {
        calls.push("two");
      },
    });

    const host = new RuntimeHost({
      application,
      modules: catalog.toRuntimeModules(),
    });

    await host.start();

    expect(calls).toEqual(["one", "two"]);
    expect(host.modules.map(module => module.manifest.id)).toEqual([
      "atlas.plugin.module-one",
      "atlas.plugin.module-two",
    ]);
  });
});
