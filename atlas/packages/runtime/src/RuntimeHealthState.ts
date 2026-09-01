export const RuntimeHealthStates = {
  Healthy: "healthy",
  Degraded: "degraded",
  Failed: "failed",
} as const;

export type RuntimeHealthState =
  typeof RuntimeHealthStates[keyof typeof RuntimeHealthStates];
