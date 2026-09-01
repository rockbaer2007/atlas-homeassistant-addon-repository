import type { RuntimeHealthReport } from "./RuntimeHealthReport";
import type { RuntimeHealthState } from "./RuntimeHealthState";

export type RuntimeDiagnosticEvent = Readonly<{
  type: "runtime.diagnostics.changed";
  timestamp: Date;
  previousHealth?: RuntimeHealthState;
  currentHealth: RuntimeHealthState;
  report: RuntimeHealthReport;
}>;
