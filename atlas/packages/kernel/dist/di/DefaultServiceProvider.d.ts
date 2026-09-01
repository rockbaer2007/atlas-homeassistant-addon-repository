import type { ServiceProvider } from "./ServiceProvider";
import type { ServiceKey } from "./ServiceKey";
import { DefaultServiceContainer } from "../container";
export declare class DefaultServiceProvider implements ServiceProvider {
    private readonly container;
    constructor(container: DefaultServiceContainer);
    get<T>(key: ServiceKey<T>): T;
    tryGet<T>(key: ServiceKey<T>): T | undefined;
}
