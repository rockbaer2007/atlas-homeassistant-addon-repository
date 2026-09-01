import type { DiagnosticContext } from "./DiagnosticContext";
import type { DiagnosticResult } from "./DiagnosticResult";
export type DiagnosticReport = Readonly<{
    context: DiagnosticContext;
    result: DiagnosticResult;
}>;
