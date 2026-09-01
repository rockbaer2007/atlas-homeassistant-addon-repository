import type { DiagnosticReport } from "./DiagnosticReport";
export interface Inspector<T>{
  inspect(target:T): DiagnosticReport;
}