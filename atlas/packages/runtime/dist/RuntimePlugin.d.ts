import type { ModuleContext, ModuleDependency } from "@atlas/kernel";
import type { RuntimeModule } from "./RuntimeModule";
export type RuntimePluginManifest = Readonly<{
    id: string;
    name: string;
    nameI18n?: Readonly<Record<string, string>>;
    version: string;
    description?: string;
    descriptionI18n?: Readonly<Record<string, string>>;
    icon?: string;
    logo?: string;
    preview?: string;
    dependencies?: readonly ModuleDependency[];
    extensionPoints?: readonly string[];
    provides?: readonly string[];
}>;
export type RuntimePluginActivationContext = ModuleContext & Readonly<{
    plugin: RuntimePluginManifest;
}>;
export interface RuntimePlugin {
    readonly manifest: RuntimePluginManifest;
    activate(context: RuntimePluginActivationContext): Promise<void>;
    deactivate?(): Promise<void>;
    dispose?(): Promise<void>;
}
export declare function createRuntimeModuleFromPlugin(plugin: RuntimePlugin): RuntimeModule;
