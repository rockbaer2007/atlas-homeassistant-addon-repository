export declare const RuntimeDiagnosticIssueCodes: {
    readonly ModuleDegraded: "runtime.module.degraded";
    readonly ModuleFailed: "runtime.module.failed";
};
export type RuntimeDiagnosticIssueCode = typeof RuntimeDiagnosticIssueCodes[keyof typeof RuntimeDiagnosticIssueCodes];
