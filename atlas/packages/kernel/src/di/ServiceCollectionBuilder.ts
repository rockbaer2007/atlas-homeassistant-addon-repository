import { ServiceDescriptorBuilder } from "./ServiceDescriptorBuilder";
import type { ServiceKey } from "./ServiceKey";
import { ServiceLifetimes } from "../container/ServiceLifetime";

export class ServiceCollectionBuilder{
  addSingleton<T>(key:ServiceKey<T>){
    return new ServiceDescriptorBuilder(key, ServiceLifetimes.Singleton);
  }
  addScoped<T>(key:ServiceKey<T>){
    return new ServiceDescriptorBuilder(key, ServiceLifetimes.Scoped);
  }
  addTransient<T>(key:ServiceKey<T>){
    return new ServiceDescriptorBuilder(key, ServiceLifetimes.Transient);
  }
}
