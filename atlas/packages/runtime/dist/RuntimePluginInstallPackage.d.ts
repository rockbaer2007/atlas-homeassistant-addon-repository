import type { RuntimePluginDescriptor } from "./RuntimePluginCatalog";
export type RuntimePluginInstallPackageFile = Readonly<{
    path: string;
    mediaType: string;
    content: string;
}>;
export type RuntimePluginInstallPackage = Readonly<{
    kind: "atlas.runtime.plugin.install-package";
    filename: string;
    plugin: RuntimePluginDescriptor;
    files: readonly RuntimePluginInstallPackageFile[];
}>;
export type RuntimePluginInstallPackageInput = Readonly<{
    plugin: RuntimePluginDescriptor;
    readme?: string;
    files?: readonly RuntimePluginInstallPackageFile[];
}>;
export declare function createRuntimePluginInstallPackage(input: RuntimePluginInstallPackageInput): RuntimePluginInstallPackage;
export declare function serializeRuntimePluginInstallManifest(plugin: RuntimePluginDescriptor): string;
export declare function parseRuntimePluginInstallPackage(value: string | unknown): RuntimePluginInstallPackage;
export declare function normalizeRuntimePluginPackageName(value: string): string;
