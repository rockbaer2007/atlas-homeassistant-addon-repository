import type { LifecycleState } from "@atlas/foundation";

import type { RuntimeHealthState } from "./RuntimeHealthState";
import type { RuntimeModuleHealthReport } from "./RuntimeModuleHealthReport";

export type RuntimeHealthReport = Readonly<{
  applicationName: string;
  applicationVersion: string;
  state: LifecycleState;
  health: RuntimeHealthState;
  modules: readonly RuntimeModuleHealthReport[];
  summary: Readonly<{
    healthy: number;
    degraded: number;
    failed: number;
  }>;
}>;
