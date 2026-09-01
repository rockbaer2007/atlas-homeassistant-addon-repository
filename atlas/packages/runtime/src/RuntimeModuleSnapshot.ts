import type { RuntimeModuleStatus } from "./RuntimeModuleStatus";

export type RuntimeModuleSnapshot = Readonly<{
  moduleId: string;
  moduleVersion: string;
  status: RuntimeModuleStatus;
  initializedAt?: number;
  stoppedAt?: number;
  disposedAt?: number;
  activationDurationMs?: number;
  shutdownDurationMs?: number;
  error?: string;
}>;
