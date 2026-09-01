import { ServiceDescriptorBuilder } from "./ServiceDescriptorBuilder";
import { ServiceLifetimes } from "../container/ServiceLifetime";
export class ServiceCollectionBuilder {
    addSingleton(key) {
        return new ServiceDescriptorBuilder(key, ServiceLifetimes.Singleton);
    }
    addScoped(key) {
        return new ServiceDescriptorBuilder(key, ServiceLifetimes.Scoped);
    }
    addTransient(key) {
        return new ServiceDescriptorBuilder(key, ServiceLifetimes.Transient);
    }
}
