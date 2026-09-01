export function createRuntimeModuleFromPlugin(plugin) {
    const manifest = toModuleManifest(plugin.manifest);
    const module = {
        async initialize(context) {
            await plugin.activate({
                ...context,
                plugin: plugin.manifest,
            });
        },
    };
    if (plugin.deactivate) {
        module.stop = () => plugin.deactivate();
    }
    if (plugin.dispose) {
        module.dispose = () => plugin.dispose();
    }
    return {
        manifest,
        module,
    };
}
function toModuleManifest(manifest) {
    return {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        dependencies: manifest.dependencies ?? [],
    };
}
