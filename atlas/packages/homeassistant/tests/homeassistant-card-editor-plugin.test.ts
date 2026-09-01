import { describe, expect, it } from "vitest";

import {
  createRuntimeModuleFromPlugin,
  RuntimeHost,
  RuntimePluginCatalog,
} from "@atlas/runtime";

import {
  createHomeAssistantCardEditorPlugin,
  createHomeAssistantCardEditorAppReleaseReadiness,
  createHomeAssistantCardEditorPluginInstallPackage,
  HomeAssistantCardEditorExtensionPoints,
  HomeAssistantCardEditorPluginCapabilities,
  HomeAssistantCardEditorPluginId,
  HomeAssistantCardEditorPluginServiceKey,
  type HomeAssistantCardEditorPluginService,
} from "../src";

describe("Home Assistant card editor plugin", () => {
  it("describes the Home Assistant card editor as the first reference plugin", () => {
    const plugin = createHomeAssistantCardEditorPlugin();

    expect(plugin.manifest).toMatchObject({
      id: HomeAssistantCardEditorPluginId,
      name: "ATLAS Home Assistant Card Editor",
      version: "0.2.0-alpha.8",
      extensionPoints: [
        HomeAssistantCardEditorExtensionPoints.cardEditor,
        HomeAssistantCardEditorExtensionPoints.cardTarget,
        HomeAssistantCardEditorExtensionPoints.entityPicker,
        HomeAssistantCardEditorExtensionPoints.exporter,
        HomeAssistantCardEditorExtensionPoints.packageBuilder,
      ],
      provides: HomeAssistantCardEditorPluginCapabilities,
    });
  });

  it("can be discovered by extension point and provided capability", () => {
    const catalog = new RuntimePluginCatalog();

    catalog.register(createHomeAssistantCardEditorPlugin());

    expect(catalog.findByExtensionPoint("homeassistant.card-editor").map(plugin => plugin.id))
      .toEqual([HomeAssistantCardEditorPluginId]);
    expect(catalog.findProviding("homeassistant.hacs-package-export").map(plugin => plugin.id))
      .toEqual([HomeAssistantCardEditorPluginId]);
  });

  it("registers card editor service metadata during runtime activation", async () => {
    const host = new RuntimeHost({
      application: {
        name: "homeassistant-card-editor-plugin",
        version: {
          major: 0,
          minor: 2,
          patch: 0,
        },
      },
      modules: [createRuntimeModuleFromPlugin(createHomeAssistantCardEditorPlugin())],
    });

    await host.start();

    const service = host.services.resolve<HomeAssistantCardEditorPluginService>(
      HomeAssistantCardEditorPluginServiceKey,
    );

    expect(service.pluginId).toBe(HomeAssistantCardEditorPluginId);
    expect(service.extensionPoints).toContain("homeassistant.entity-picker");
    expect(service.capabilities).toContain("homeassistant.expert-editor");
    expect(service.cardTargets.map(target => target.target)).toContain("entities");
    expect(service.cardTargets.map(target => target.target)).toContain("mushroom-template");
    expect(service.cardTargets.map(target => target.target)).toContain("bubble");
    expect(service.cardTargets.map(target => target.target)).toContain("tabbed-card-v2");
    expect(service.templates.map(template => template.id)).toContain("vertical-stack");
    expect(service.templates.map(template => template.id)).toContain("tabbed-card-v2");
    expect(service.bubbleButtonTypes).toEqual([
      "state",
      "switch",
      "slider",
      "name",
    ]);
  });

  it("creates an install package for the reference plugin", () => {
    const installPackage = createHomeAssistantCardEditorPluginInstallPackage();

    expect(installPackage).toMatchObject({
      kind: "atlas.runtime.plugin.install-package",
      filename: "atlas-plugin-homeassistant-card-editor.atlas-plugin.json",
      plugin: {
        id: HomeAssistantCardEditorPluginId,
      },
    });
    expect(installPackage.files.map(file => file.path)).toEqual([
      "atlas-plugin.json",
      "README.md",
      "examples/homeassistant-card-editor.yaml",
    ]);
    expect(JSON.parse(installPackage.files[0]!.content)).toMatchObject({
      id: HomeAssistantCardEditorPluginId,
      extensionPoints: [
        "homeassistant.card-editor",
        "homeassistant.card-target",
        "homeassistant.entity-picker",
        "homeassistant.exporter",
        "atlas.plugin.package-builder",
      ],
    });
  });

  it("describes app release readiness for Administration and the Card Editor", () => {
    const readiness = createHomeAssistantCardEditorAppReleaseReadiness();

    expect(readiness).toMatchObject({
      kind: "atlas.homeassistant.card-editor.app-release-readiness",
      appId: "atlas.homeassistant.card-editor",
      releaseChannel: "local-preview",
      summary: {
        ready: 3,
        inProgress: 1,
        planned: 1,
      },
      recommendedNextStep: "Install the prepared Home Assistant App/Add-on package in a local Home Assistant /addons directory, then add the Linux installer after the container contract stays stable.",
    });
    expect(readiness.entrypoints.map(entrypoint => entrypoint.port)).toEqual([4175, 4174]);
    expect(readiness.checks.map(check => [check.id, check.status])).toContainEqual([
      "problem-report-preview",
      "ready",
    ]);
    expect(readiness.targets.map(target => [target.id, target.status])).toEqual([
      ["standalone-docker", "ready"],
      ["home-assistant-app", "in-progress"],
      ["linux-installer", "planned"],
      ["atlas-plugin", "ready"],
      ["home-assistant-hacs", "planned"],
    ]);
  });
});
