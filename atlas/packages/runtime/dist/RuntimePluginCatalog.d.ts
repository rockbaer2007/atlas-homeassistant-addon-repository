import type { ModuleDependency } from "@atlas/kernel";
import { type RuntimePlugin } from "./RuntimePlugin";
import type { RuntimeModule } from "./RuntimeModule";
export type RuntimePluginDescriptor = Readonly<{
    id: string;
    name: string;
    nameI18n?: Readonly<Record<string, string>>;
    version: string;
    description?: string;
    descriptionI18n?: Readonly<Record<string, string>>;
    icon?: string;
    logo?: string;
    preview?: string;
    dependencies: readonly ModuleDependency[];
    extensionPoints: readonly string[];
    provides: readonly string[];
}>;
export declare class RuntimePluginCatalog {
    private readonly entries;
    register(plugin: RuntimePlugin): void;
    list(): readonly RuntimePluginDescriptor[];
    findByExtensionPoint(extensionPoint: string): readonly RuntimePluginDescriptor[];
    findProviding(capability: string): readonly RuntimePluginDescriptor[];
    toRuntimeModules(): readonly RuntimeModule[];
}
export declare function describeRuntimePlugin(plugin: RuntimePlugin): RuntimePluginDescriptor;
