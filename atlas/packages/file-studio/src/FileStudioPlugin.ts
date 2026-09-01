import {
  createRuntimePluginInstallPackage,
  describeRuntimePlugin,
  type RuntimePlugin,
  type RuntimePluginInstallPackage,
} from "@atlas/runtime";

export const FileStudioPluginId = "atlas.plugin.file-studio";

export const FileStudioExtensionPoints = {
  fileTree: "atlas.file-studio.file-tree",
  editor: "atlas.file-studio.editor",
  validator: "atlas.file-studio.validator",
  transfer: "atlas.file-studio.transfer",
  accessPolicy: "atlas.file-studio.access-policy",
} as const;

export type FileStudioExtensionPoint =
  typeof FileStudioExtensionPoints[keyof typeof FileStudioExtensionPoints];

export const FileStudioPluginCapabilities = [
  "atlas.file-tree",
  "atlas.file-editor",
  "atlas.image-preview",
  "atlas.archive-preview",
  "atlas.syntax-highlighting",
  "atlas.yaml-validation",
  "atlas.file-upload",
  "atlas.file-download",
  "atlas.scoped-filesystem",
] as const;

export type FileStudioPluginCapability =
  typeof FileStudioPluginCapabilities[number];

export type FileStudioAccessMode = "read" | "read-write";

export type FileStudioRootScope = Readonly<{
  id: string;
  label: string;
  path: string;
  access: FileStudioAccessMode;
  enabled: boolean;
  requiresAdminApproval: boolean;
}>;

export type FileStudioAccessPolicy = Readonly<{
  defaultRoot: "/config";
  allowFreeRootAccess: false;
  roots: readonly FileStudioRootScope[];
}>;

export type FileStudioAccessPolicyInput = Readonly<{
  allowAddOnDirectory?: boolean;
}>;

export type FileStudioPluginService = Readonly<{
  pluginId: typeof FileStudioPluginId;
  extensionPoints: readonly FileStudioExtensionPoint[];
  capabilities: readonly FileStudioPluginCapability[];
  accessPolicy: FileStudioAccessPolicy;
}>;

export const FileStudioPluginServiceKey =
  Symbol("@atlas/file-studio/plugin");

export function createFileStudioAccessPolicy(
  input: FileStudioAccessPolicyInput = {},
): FileStudioAccessPolicy {
  return {
    defaultRoot: "/config",
    allowFreeRootAccess: false,
    roots: [
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
        enabled: input.allowAddOnDirectory === true,
        requiresAdminApproval: true,
      },
    ],
  };
}

export function createFileStudioPluginService(
  input: FileStudioAccessPolicyInput = {},
): FileStudioPluginService {
  return {
    pluginId: FileStudioPluginId,
    extensionPoints: Object.values(FileStudioExtensionPoints),
    capabilities: FileStudioPluginCapabilities,
    accessPolicy: createFileStudioAccessPolicy(input),
  };
}

export function createFileStudioPlugin(
  input: FileStudioAccessPolicyInput = {},
): RuntimePlugin {
  return {
    manifest: {
      id: FileStudioPluginId,
      name: "ATLAS File Studio",
      nameI18n: {
        de: "ATLAS File Studio",
        en: "ATLAS File Studio",
      },
      version: "0.1.21",
      description: "Scoped file tree, editor, image preview and ZIP inspection plugin for Home Assistant configuration files.",
      descriptionI18n: {
        de: "Abgesichertes Dateibaum-, Editor-, Bildvorschau- und ZIP-Inspektions-Plugin für Home-Assistant-Konfigurationsdateien.",
        en: "Scoped file tree, editor, image preview and ZIP inspection plugin for Home Assistant configuration files.",
      },
      icon: "icon.svg",
      preview: "preview.svg",
      extensionPoints: Object.values(FileStudioExtensionPoints),
      provides: FileStudioPluginCapabilities,
    },
    async activate(context) {
      context.services.add({
        key: FileStudioPluginServiceKey,
        lifetime: "singleton",
        instance: createFileStudioPluginService(input),
      });
    },
  };
}

export function createFileStudioPluginInstallPackage(): RuntimePluginInstallPackage {
  const plugin = createFileStudioPlugin();

  return createRuntimePluginInstallPackage({
    plugin: describeRuntimePlugin(plugin),
    readme: [
      "# ATLAS File Studio",
      "",
      "ATLAS File Studio is the second independent ATLAS plugin line.",
      "",
      "It prepares a scoped Home Assistant file editor with a file tree, editor",
      "surface, image previews, ZIP inspection, syntax highlighting, YAML validation and upload/download flows.",
      "",
      "The default root is `/config`. The add-on directory is only available",
      "after Administration approval. Free root access is disabled by default.",
      "",
    ].join("\n"),
    files: [
      {
        path: "examples/access-policy.json",
        mediaType: "application/json",
        content: `${JSON.stringify(createFileStudioAccessPolicy(), null, 2)}\n`,
      },
    ],
  });
}
