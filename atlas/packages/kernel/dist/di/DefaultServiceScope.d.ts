import type { ServiceScope } from "./ServiceScope";
import type { ServiceProvider } from "./ServiceProvider";
export declare class DefaultServiceScope implements ServiceScope {
    readonly provider: ServiceProvider;
    constructor(provider: ServiceProvider);
    dispose(): void;
}
