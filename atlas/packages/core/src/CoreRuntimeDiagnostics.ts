import type { CoreRuntimeHost } from "./CoreRuntimeHost";

export type CoreRuntimeHealthReport = CoreRuntimeHost["health"];
export type CoreRuntimeDiagnosticReport = CoreRuntimeHost["diagnostics"];

export type CoreRuntimeDiagnostics = Readonly<{
  health: CoreRuntimeHealthReport;
  report: CoreRuntimeDiagnosticReport;
}>;

export function inspectCoreRuntimeHost(
  host: CoreRuntimeHost,
): CoreRuntimeDiagnostics {
  return {
    health: host.health,
    report: host.diagnostics,
  };
}
