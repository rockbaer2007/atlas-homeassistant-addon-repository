import type { ServiceCollection } from "./ServiceCollection";
import type { ServiceDescriptor } from "./ServiceDescriptor";
import type { ServiceResolver } from "./ServiceResolver";
import type { ServiceContainer } from "../contracts/ServiceContainer";
export declare class DefaultServiceContainer implements ServiceCollection, ServiceContainer, ServiceResolver {
    private readonly descriptorByKey;
    private readonly singletons;
    add<T>(descriptor: ServiceDescriptor<T>): void;
    register<T>(key: symbol, instance: T): void;
    descriptors(): readonly ServiceDescriptor[];
    contains(key: symbol): boolean;
    resolve<T>(key: symbol): T;
    private keyId;
}
