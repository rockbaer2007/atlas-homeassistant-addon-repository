import type { ServiceCollection } from "./ServiceCollection";
import type { ServiceDescriptor } from "./ServiceDescriptor";
import type { ServiceResolver } from "./ServiceResolver";
import type { ServiceKey } from "../di/ServiceKey";
import type { ServiceContainer } from "../contracts/ServiceContainer";
import { ServiceLifetimes } from "./ServiceLifetime";

export class DefaultServiceContainer
implements ServiceCollection, ServiceContainer, ServiceResolver {

  private readonly descriptorByKey = new Map<symbol, ServiceDescriptor>();
  private readonly singletons = new Map<symbol, unknown>();

  add<T>(descriptor: ServiceDescriptor<T>): void {
    this.descriptorByKey.set(this.keyId(descriptor.key), descriptor);
  }

  register<T>(key: symbol, instance: T): void {
    this.add({
      key,
      lifetime: ServiceLifetimes.Singleton,
      instance,
    });
  }

  descriptors(): readonly ServiceDescriptor[] {
    return [...this.descriptorByKey.values()];
  }

  contains(key: symbol): boolean {
    return this.descriptorByKey.has(key);
  }

  resolve<T>(key: symbol): T {
    const descriptor = this.descriptorByKey.get(key);

    if (!descriptor) {
      throw new Error(`Service not registered: ${String(key)}`);
    }

    if (descriptor.instance !== undefined) {
      return descriptor.instance as T;
    }

    const create = () => {
      if (descriptor.factory) {
        return descriptor.factory(this as never);
      }

      if (descriptor.implementation) {
        return new descriptor.implementation();
      }

      throw new Error("Invalid service descriptor.");
    };

    if (descriptor.lifetime === ServiceLifetimes.Singleton) {
      if (!this.singletons.has(key)) {
        this.singletons.set(key, create());
      }
      return this.singletons.get(key) as T;
    }

    return create() as T;
  }

  private keyId(key: ServiceKey | symbol): symbol {
    return typeof key === "symbol" ? key : key.id;
  }
}
