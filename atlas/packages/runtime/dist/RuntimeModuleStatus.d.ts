export declare const RuntimeModuleStatuses: {
    readonly Registered: "registered";
    readonly Initialized: "initialized";
    readonly Stopped: "stopped";
    readonly Disposed: "disposed";
    readonly Failed: "failed";
};
export type RuntimeModuleStatus = typeof RuntimeModuleStatuses[keyof typeof RuntimeModuleStatuses];
