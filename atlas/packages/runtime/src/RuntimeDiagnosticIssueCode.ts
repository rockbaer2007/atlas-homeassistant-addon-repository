export const RuntimeDiagnosticIssueCodes = {
  ModuleDegraded: "runtime.module.degraded",
  ModuleFailed: "runtime.module.failed",
} as const;

export type RuntimeDiagnosticIssueCode =
  typeof RuntimeDiagnosticIssueCodes[keyof typeof RuntimeDiagnosticIssueCodes];
