export function inspectCoreRuntimeHost(host) {
    return {
        health: host.health,
        report: host.diagnostics,
    };
}
