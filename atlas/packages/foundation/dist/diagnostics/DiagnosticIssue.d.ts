import type { DiagnosticSeverity } from "./DiagnosticSeverity";
export type DiagnosticIssue = Readonly<{
    code: string;
    message: string;
    severity: DiagnosticSeverity;
}>;
