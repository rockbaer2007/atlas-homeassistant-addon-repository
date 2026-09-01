export function createRendererAdapterSelectionRequest(request) {
    return {
        ...request,
        candidates: [...request.candidates],
    };
}
export function createRendererAdapterSelectionResult(result) {
    return {
        ...result,
    };
}
export function selectFirstRendererAdapterCandidate(request) {
    const adapter = request.candidates[0];
    return createRendererAdapterSelectionResult({
        name: request.name,
        ...(adapter ? { adapter } : {}),
    });
}
