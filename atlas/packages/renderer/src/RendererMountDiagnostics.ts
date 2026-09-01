import type { RendererMountResult } from "./RendererMount";

export const RendererMountDiagnosticCodes = {
  MountFailed: "renderer.mount.failed",
} as const;

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

export function inspectRendererMountResult(
  result: RendererMountResult,
): RendererMountDiagnosticReport {
  const issues = result.error
    ? [{
      code: RendererMountDiagnosticCodes.MountFailed,
      message: result.error,
      severity: "error" as const,
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
