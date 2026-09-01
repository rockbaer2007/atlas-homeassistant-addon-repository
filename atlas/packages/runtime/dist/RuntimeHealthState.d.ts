export declare const RuntimeHealthStates: {
    readonly Healthy: "healthy";
    readonly Degraded: "degraded";
    readonly Failed: "failed";
};
export type RuntimeHealthState = typeof RuntimeHealthStates[keyof typeof RuntimeHealthStates];
