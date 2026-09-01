export declare const ModuleHealthStates: {
    readonly Healthy: "healthy";
    readonly Degraded: "degraded";
    readonly Failed: "failed";
};
export type ModuleHealth = typeof ModuleHealthStates[keyof typeof ModuleHealthStates];
export type ModuleHealthReport = {
    moduleId: string;
    health: ModuleHealth;
};
