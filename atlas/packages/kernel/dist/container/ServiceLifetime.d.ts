export declare const ServiceLifetimes: {
    readonly Singleton: "singleton";
    readonly Scoped: "scoped";
    readonly Transient: "transient";
};
export type ServiceLifetime = typeof ServiceLifetimes[keyof typeof ServiceLifetimes];
