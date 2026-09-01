import { createRuntimePluginInstallPackage, describeRuntimePlugin, } from "@atlas/runtime";
export const FileStudioPluginId = "atlas.plugin.file-studio";
export const FileStudioExtensionPoints = {
    fileTree: "atlas.file-studio.file-tree",
    editor: "atlas.file-studio.editor",
    validator: "atlas.file-studio.validator",
    transfer: "atlas.file-studio.transfer",
    accessPolicy: "atlas.file-studio.access-policy",
};
export const FileStudioPluginCapabilities = [
    "atlas.file-tree",
    "atlas.file-editor",
    "atlas.syntax-highlighting",
    "atlas.yaml-validation",
    "atlas.file-upload",
    "atlas.file-download",
    "atlas.scoped-filesystem",
];
export const FileStudioPluginServiceKey = Symbol("@atlas/file-studio/plugin");
export function createFileStudioAccessPolicy(input = {}) {
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
export function createFileStudioPluginService(input = {}) {
    return {
        pluginId: FileStudioPluginId,
        extensionPoints: Object.values(FileStudioExtensionPoints),
        capabilities: FileStudioPluginCapabilities,
        accessPolicy: createFileStudioAccessPolicy(input),
    };
}
export function createFileStudioPlugin(input = {}) {
    return {
        manifest: {
            id: FileStudioPluginId,
            name: "ATLAS File Studio",
            nameI18n: {
                de: "ATLAS File Studio",
                en: "ATLAS File Studio",
            },
            version: "0.1.4",
            description: "Scoped file tree and editor plugin for Home Assistant configuration files.",
            descriptionI18n: {
                de: "Abgesichertes Dateibaum- und Editor-Plugin für Home-Assistant-Konfigurationsdateien.",
                en: "Scoped file tree and editor plugin for Home Assistant configuration files.",
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
export function createFileStudioPluginInstallPackage() {
    const plugin = createFileStudioPlugin();
    return createRuntimePluginInstallPackage({
        plugin: describeRuntimePlugin(plugin),
        readme: [
            "# ATLAS File Studio",
            "",
            "ATLAS File Studio is the second independent ATLAS plugin line.",
            "",
            "It prepares a scoped Home Assistant file editor with a file tree, editor",
            "surface, syntax highlighting, YAML validation and upload/download flows.",
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
