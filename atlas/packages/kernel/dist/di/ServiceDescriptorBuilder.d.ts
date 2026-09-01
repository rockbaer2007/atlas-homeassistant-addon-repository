import type { ServiceDescriptor, ServiceFactory, ServiceImplementation } from "../container/ServiceDescriptor";
import type { ServiceLifetime } from "../container/ServiceLifetime";
import type { ServiceKey } from "./ServiceKey";
export declare class ServiceDescriptorBuilder<T> {
    private readonly key;
    private readonly lifetime;
    constructor(key: ServiceKey<T>, lifetime: ServiceLifetime);
    implementation(type: ServiceImplementation<T>): ServiceDescriptor<T>;
    factory(factory: ServiceFactory<T>): ServiceDescriptor<T>;
    instance(instance: T): ServiceDescriptor<T>;
}
