export declare const DiagnosticSeverities: {
    readonly Info: "info";
    readonly Warning: "warning";
    readonly Error: "error";
};
export type DiagnosticSeverity = typeof DiagnosticSeverities[keyof typeof DiagnosticSeverities];
