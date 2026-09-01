export const RendererMountDiagnosticCodes = {
    MountFailed: "renderer.mount.failed",
};
export function inspectRendererMountResult(result) {
    const issues = result.error
        ? [{
                code: RendererMountDiagnosticCodes.MountFailed,
                message: result.error,
                severity: "error",
            }]
        : [];
    return {
        context: {
            component: "renderer.mount",
        },
        result: {
            ok: issues.length === 0,
            issues,
        },
    };
}
