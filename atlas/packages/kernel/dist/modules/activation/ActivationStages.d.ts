export declare const ActivationStages: {
    readonly Discover: "discover";
    readonly Validate: "validate";
    readonly ResolveDependencies: "resolve-dependencies";
    readonly Sort: "sort";
    readonly CreateContext: "create-context";
    readonly RegisterServices: "register-services";
    readonly Initialize: "initialize";
    readonly Activate: "activate";
    readonly Healthy: "healthy";
};
export type ActivationStage = typeof ActivationStages[keyof typeof ActivationStages];
