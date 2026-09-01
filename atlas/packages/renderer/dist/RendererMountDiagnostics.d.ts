import type { RendererMountResult } from "./RendererMount";
export declare const RendererMountDiagnosticCodes: {
    readonly MountFailed: "renderer.mount.failed";
};
export type RendererMountDiagnosticReport = Readonly<{
    context: Readonly<{
        component: string;
    }>;
    result: Readonly<{
        ok: boolean;
        issues: readonly Readonly<{
            code: string;
            message: string;
            severity: "error";
        }>[];
    }>;
}>;
export declare function inspectRendererMountResult(result: RendererMountResult): RendererMountDiagnosticReport;
