export function createRendererPlatformAdapterSelectionRequest(request) {
    return {
        ...request,
        candidates: [...request.candidates],
    };
}
export function createRendererPlatformAdapterSelectionResult(result) {
    return {
        ...result,
    };
}
export function selectFirstRendererPlatformAdapterCandidate(request) {
    const platformAdapter = request.candidates[0];
    return createRendererPlatformAdapterSelectionResult({
        platform: request.platform,
        ...(platformAdapter ? { platformAdapter } : {}),
    });
}
