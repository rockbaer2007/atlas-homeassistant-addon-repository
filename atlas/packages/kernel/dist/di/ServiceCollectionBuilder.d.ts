import { ServiceDescriptorBuilder } from "./ServiceDescriptorBuilder";
import type { ServiceKey } from "./ServiceKey";
export declare class ServiceCollectionBuilder {
    addSingleton<T>(key: ServiceKey<T>): ServiceDescriptorBuilder<unknown>;
    addScoped<T>(key: ServiceKey<T>): ServiceDescriptorBuilder<unknown>;
    addTransient<T>(key: ServiceKey<T>): ServiceDescriptorBuilder<unknown>;
}
