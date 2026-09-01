import { type RuntimePlugin, type RuntimePluginInstallPackage } from "@atlas/runtime";
export declare const FileStudioPluginId = "atlas.plugin.file-studio";
export declare const FileStudioExtensionPoints: {
    readonly fileTree: "atlas.file-studio.file-tree";
    readonly editor: "atlas.file-studio.editor";
    readonly validator: "atlas.file-studio.validator";
    readonly transfer: "atlas.file-studio.transfer";
    readonly accessPolicy: "atlas.file-studio.access-policy";
};
export type FileStudioExtensionPoint = typeof FileStudioExtensionPoints[keyof typeof FileStudioExtensionPoints];
export declare const FileStudioPluginCapabilities: readonly ["atlas.file-tree", "atlas.file-editor", "atlas.image-preview", "atlas.archive-preview", "atlas.syntax-highlighting", "atlas.yaml-validation", "atlas.file-upload", "atlas.file-download", "atlas.scoped-filesystem"];
export type FileStudioPluginCapability = typeof FileStudioPluginCapabilities[number];
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
export declare const FileStudioPluginServiceKey: unique symbol;
export declare function createFileStudioAccessPolicy(input?: FileStudioAccessPolicyInput): FileStudioAccessPolicy;
export declare function createFileStudioPluginService(input?: FileStudioAccessPolicyInput): FileStudioPluginService;
export declare function createFileStudioPlugin(input?: FileStudioAccessPolicyInput): RuntimePlugin;
export declare function createFileStudioPluginInstallPackage(): RuntimePluginInstallPackage;
