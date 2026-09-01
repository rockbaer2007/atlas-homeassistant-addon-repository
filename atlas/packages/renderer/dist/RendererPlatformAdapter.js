export function createRendererPlatformAdapter(platformAdapter) {
    return {
        ...platformAdapter,
        capabilities: [...platformAdapter.capabilities],
    };
}
