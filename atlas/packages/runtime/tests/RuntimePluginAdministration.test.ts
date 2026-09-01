import { describe, expect, it } from "vitest";

import {
  createRuntimePluginAdministrationView,
  RuntimePluginCatalog,
} from "../src";

describe("RuntimePluginAdministration", () => {
  it("creates an administration view from a plugin catalog", () => {
    const catalog = new RuntimePluginCatalog();

    catalog.register({
      manifest: {
        id: "atlas.plugin.editor",
        name: "Editor plugin",
        version: "1.0.0",
        extensionPoints: ["homeassistant.card-editor"],
        provides: ["homeassistant.expert-editor"],
      },
      async activate() {},
    });
    catalog.register({
      manifest: {
        id: "atlas.plugin.diagnostics-panel",
        name: "Diagnostics Panel",
        version: "1.0.0",
      },
      async activate() {},
    });

    const view = createRuntimePluginAdministrationView({
      plugins: catalog,
      activePluginIds: ["atlas.plugin.editor"],
      disabledPluginIds: ["atlas.plugin.diagnostics-panel"],
    });

    expect(view.summary).toEqual({
      total: 2,
      active: 1,
      available: 0,
      disabled: 1,
    });
    expect(view.plugins).toMatchObject([
      {
        id: "atlas.plugin.editor",
        status: "active",
        actions: ["inspect", "deactivate", "export-package"],
      },
      {
        id: "atlas.plugin.diagnostics-panel",
        status: "disabled",
        actions: ["inspect", "activate"],
      },
    ]);
  });

  it("marks unknown state plugins as available", () => {
    const view = createRuntimePluginAdministrationView({
      plugins: [{
        id: "atlas.plugin.available",
        name: "Available plugin",
        version: "1.0.0",
        dependencies: [],
        extensionPoints: [],
        provides: [],
      }],
    });

    expect(view.summary).toEqual({
      total: 1,
      active: 0,
      available: 1,
      disabled: 0,
    });
    expect(view.plugins[0]).toMatchObject({
      status: "available",
      actions: ["inspect", "activate", "export-package"],
    });
  });
});
