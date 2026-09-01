import { describe, expect, it } from "vitest";

import type { Application } from "@atlas/kernel";

import {
  createRuntimeModuleFromPlugin,
  RuntimeHost,
  type RuntimePlugin,
  type RuntimePluginActivationContext,
  type RuntimePluginManifest,
  RuntimeModuleStatuses,
} from "../src";

const application: Application = {
  name: "plugin-runtime",
  version: {
    major: 0,
    minor: 2,
    patch: 0,
  },
};

describe("RuntimePlugin", () => {
  it("adapts a plugin manifest to a runtime module manifest", () => {
    const manifest: RuntimePluginManifest = {
      id: "atlas.plugin.demo",
      name: "Demo plugin",
      version: "1.0.0",
      description: "Plugin adapter demo",
      dependencies: [{ id: "atlas.plugin.base", version: "1.0.0" }],
      extensionPoints: ["homeassistant.card-target"],
      provides: ["demo-card"],
    };
    const plugin: RuntimePlugin = {
      manifest,
      async activate() {},
    };

    const runtimeModule = createRuntimeModuleFromPlugin(plugin);

    expect(runtimeModule.manifest).toEqual({
      id: "atlas.plugin.demo",
      name: "Demo plugin",
      version: "1.0.0",
      description: "Plugin adapter demo",
      dependencies: [{ id: "atlas.plugin.base", version: "1.0.0" }],
    });
  });

  it("activates a plugin through the runtime host module lifecycle", async () => {
    let receivedContext: RuntimePluginActivationContext | undefined;
    const plugin: RuntimePlugin = {
      manifest: {
        id: "atlas.plugin.lifecycle",
        name: "Lifecycle plugin",
        version: "1.0.0",
        extensionPoints: ["devtools.panel"],
        provides: ["lifecycle-panel"],
      },
      async activate(context) {
        receivedContext = context;
      },
    };
    const host = new RuntimeHost(application);

    host.registerModule(createRuntimeModuleFromPlugin(plugin));
    await host.start();

    expect(receivedContext?.plugin).toBe(plugin.manifest);
    expect(receivedContext?.services).toBe(host.services);
    expect(host.moduleDiagnostics).toMatchObject([{
      moduleId: "atlas.plugin.lifecycle",
      status: RuntimeModuleStatuses.Initialized,
    }]);
  });

  it("delegates runtime stop and dispose to optional plugin hooks", async () => {
    const calls: string[] = [];
    const plugin: RuntimePlugin = {
      manifest: {
        id: "atlas.plugin.shutdown",
        name: "Shutdown plugin",
        version: "1.0.0",
      },
      async activate() {
        calls.push("activate");
      },
      async deactivate() {
        calls.push("deactivate");
      },
      async dispose() {
        calls.push("dispose");
      },
    };
    const host = new RuntimeHost(application);

    host.registerModule(createRuntimeModuleFromPlugin(plugin));
    await host.start();
    await host.dispose();

    expect(calls).toEqual(["activate", "deactivate", "dispose"]);
    expect(host.moduleDiagnostics).toMatchObject([{
      moduleId: "atlas.plugin.shutdown",
      status: RuntimeModuleStatuses.Disposed,
    }]);
  });
});
