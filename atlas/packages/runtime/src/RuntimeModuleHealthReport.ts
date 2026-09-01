import type { RuntimeHealthState } from "./RuntimeHealthState";
import type { RuntimeModuleStatus } from "./RuntimeModuleStatus";

export type RuntimeModuleHealthReport = Readonly<{
  moduleId: string;
  moduleVersion: string;
  health: RuntimeHealthState;
  status: RuntimeModuleStatus;
  error?: string;
}>;
