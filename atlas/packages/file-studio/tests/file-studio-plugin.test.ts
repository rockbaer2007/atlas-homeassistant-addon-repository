import { describe, expect, it } from "vitest";

import {
  createRuntimeModuleFromPlugin,
  RuntimeHost,
  RuntimePluginCatalog,
} from "@atlas/runtime";

import {
  createFileStudioAccessPolicy,
  createFileStudioPlugin,
  createFileStudioPluginInstallPackage,
  FileStudioExtensionPoints,
  FileStudioPluginCapabilities,
  FileStudioPluginId,
  FileStudioPluginServiceKey,
  type FileStudioPluginService,
} from "../src";

describe("File Studio plugin", () => {
  it("describes File Studio as the second independent ATLAS plugin", () => {
    const plugin = createFileStudioPlugin();

    expect(plugin.manifest).toMatchObject({
      id: FileStudioPluginId,
      name: "ATLAS File Studio",
      version: "0.1.13",
      extensionPoints: [
        FileStudioExtensionPoints.fileTree,
        FileStudioExtensionPoints.editor,
        FileStudioExtensionPoints.validator,
        FileStudioExtensionPoints.transfer,
        FileStudioExtensionPoints.accessPolicy,
      ],
      provides: FileStudioPluginCapabilities,
    });
  });

  it("can be discovered by file editing capabilities", () => {
    const catalog = new RuntimePluginCatalog();

    catalog.register(createFileStudioPlugin());

    expect(catalog.findByExtensionPoint("atlas.file-studio.editor").map(plugin => plugin.id))
      .toEqual([FileStudioPluginId]);
    expect(catalog.findProviding("atlas.yaml-validation").map(plugin => plugin.id))
      .toEqual([FileStudioPluginId]);
  });

  it("uses /config as default and keeps add-ons behind admin approval", () => {
    const policy = createFileStudioAccessPolicy();

    expect(policy).toMatchObject({
      defaultRoot: "/config",
      allowFreeRootAccess: false,
    });
    expect(policy.roots).toEqual([
      {
        id: "homeassistant-config",
        label: "Home Assistant /config",
        path: "/config",
        access: "read-write",
        enabled: true,
        requiresAdminApproval: false,
      },
      {
        id: "homeassistant-addons",
        label: "Home Assistant add-on directory",
        path: "/addons",
        access: "read-write",
        enabled: false,
        requiresAdminApproval: true,
      },
    ]);
  });

  it("enables the add-on directory only when Administration approves it", () => {
    const policy = createFileStudioAccessPolicy({ allowAddOnDirectory: true });

    expect(policy.roots.find(root => root.id === "homeassistant-addons"))
      .toMatchObject({
        path: "/addons",
        enabled: true,
        requiresAdminApproval: true,
      });
  });

  it("registers File Studio service metadata during runtime activation", async () => {
    const host = new RuntimeHost({
      application: {
        name: "file-studio-plugin",
        version: {
          major: 0,
          minor: 1,
          patch: 0,
        },
      },
      modules: [createRuntimeModuleFromPlugin(createFileStudioPlugin())],
    });

    await host.start();

    const service = host.services.resolve<FileStudioPluginService>(
      FileStudioPluginServiceKey,
    );

    expect(service.pluginId).toBe(FileStudioPluginId);
    expect(service.capabilities).toContain("atlas.file-tree");
    expect(service.capabilities).toContain("atlas.yaml-validation");
    expect(service.accessPolicy.defaultRoot).toBe("/config");
  });

  it("creates an install package for repository installs", () => {
    const installPackage = createFileStudioPluginInstallPackage();

    expect(installPackage).toMatchObject({
      kind: "atlas.runtime.plugin.install-package",
      filename: "atlas-plugin-file-studio.atlas-plugin.json",
      plugin: {
        id: FileStudioPluginId,
      },
    });
    expect(installPackage.files.map(file => file.path)).toEqual([
      "atlas-plugin.json",
      "README.md",
      "examples/access-policy.json",
    ]);
  });
});
