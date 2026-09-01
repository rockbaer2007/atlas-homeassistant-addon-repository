export const RuntimeModuleStatuses = {
  Registered: "registered",
  Initialized: "initialized",
  Stopped: "stopped",
  Disposed: "disposed",
  Failed: "failed",
} as const;

export type RuntimeModuleStatus =
  typeof RuntimeModuleStatuses[keyof typeof RuntimeModuleStatuses];
