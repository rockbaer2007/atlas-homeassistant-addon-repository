export function createRuntimePluginAdministrationView(input) {
    const activePluginIds = new Set(input.activePluginIds ?? []);
    const disabledPluginIds = new Set(input.disabledPluginIds ?? []);
    const descriptors = isRuntimePluginCatalogLike(input.plugins)
        ? input.plugins.list()
        : input.plugins;
    const plugins = descriptors.map(plugin => {
        const status = pluginStatus(plugin.id, activePluginIds, disabledPluginIds);
        return {
            ...plugin,
            status,
            actions: pluginActions(status),
        };
    });
    return {
        plugins,
        summary: {
            total: plugins.length,
            active: plugins.filter(plugin => plugin.status === "active").length,
            available: plugins.filter(plugin => plugin.status === "available").length,
            disabled: plugins.filter(plugin => plugin.status === "disabled").length,
        },
    };
}
function pluginStatus(pluginId, activePluginIds, disabledPluginIds) {
    if (disabledPluginIds.has(pluginId))
        return "disabled";
    if (activePluginIds.has(pluginId))
        return "active";
    return "available";
}
function pluginActions(status) {
    if (status === "active")
        return ["inspect", "deactivate", "export-package"];
    if (status === "disabled")
        return ["inspect", "activate"];
    return ["inspect", "activate", "export-package"];
}
function isRuntimePluginCatalogLike(plugins) {
    return typeof plugins.list === "function";
}
