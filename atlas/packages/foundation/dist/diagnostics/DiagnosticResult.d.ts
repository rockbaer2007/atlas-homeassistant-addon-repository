import type { DiagnosticIssue } from "./DiagnosticIssue";
export type DiagnosticResult = Readonly<{
    ok: boolean;
    issues: readonly DiagnosticIssue[];
}>;
