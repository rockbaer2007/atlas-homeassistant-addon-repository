import type { ServiceDescriptor, ServiceFactory, ServiceImplementation } from "../container/ServiceDescriptor";
import type { ServiceLifetime } from "../container/ServiceLifetime";
import type { ServiceKey } from "./ServiceKey";

export class ServiceDescriptorBuilder<T>{
  constructor(
    private readonly key: ServiceKey<T>,
    private readonly lifetime: ServiceLifetime
  ){}

  implementation(type: ServiceImplementation<T>): ServiceDescriptor<T>{
    return { key:this.key, lifetime:this.lifetime, implementation:type };
  }

  factory(factory: ServiceFactory<T>): ServiceDescriptor<T>{
    return { key:this.key, lifetime:this.lifetime, factory };
  }

  instance(instance:T): ServiceDescriptor<T>{
    return { key:this.key, lifetime:this.lifetime, instance };
  }
}
