export async function transitionCoreRuntimeHost(host, action) {
    await host[action]();
    return {
        action,
        state: host.state,
    };
}
