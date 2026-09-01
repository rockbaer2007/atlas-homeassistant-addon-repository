import { createRuntimeModuleFromPlugin, } from "./RuntimePlugin";
export class RuntimePluginCatalog {
    entries = new Map();
    register(plugin) {
        const descriptor = describeRuntimePlugin(plugin);
        if (this.entries.has(descriptor.id)) {
            throw new Error(`Runtime plugin already registered: ${descriptor.id}`);
        }
        this.entries.set(descriptor.id, {
            plugin,
            descriptor,
        });
    }
    list() {
        return [...this.entries.values()].map(entry => entry.descriptor);
    }
    findByExtensionPoint(extensionPoint) {
        return this.list().filter(plugin => plugin.extensionPoints.includes(extensionPoint));
    }
    findProviding(capability) {
        return this.list().filter(plugin => plugin.provides.includes(capability));
    }
    toRuntimeModules() {
        return [...this.entries.values()].map(entry => createRuntimeModuleFromPlugin(entry.plugin));
    }
}
export function describeRuntimePlugin(plugin) {
    const manifest = plugin.manifest;
    assertNonEmptyString(manifest.id, "Runtime plugin id is required.");
    assertNonEmptyString(manifest.name, `Runtime plugin name is required: ${manifest.id}`);
    assertNonEmptyString(manifest.version, `Runtime plugin version is required: ${manifest.id}`);
    return {
        id: manifest.id,
        name: manifest.name,
        nameI18n: manifest.nameI18n,
        version: manifest.version,
        description: manifest.description,
        descriptionI18n: manifest.descriptionI18n,
        icon: manifest.icon,
        logo: manifest.logo,
        preview: manifest.preview,
        dependencies: [...(manifest.dependencies ?? [])],
        extensionPoints: [...(manifest.extensionPoints ?? [])],
        provides: [...(manifest.provides ?? [])],
    };
}
function assertNonEmptyString(value, message) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(message);
    }
}
