import { ServiceLifetimes } from "./ServiceLifetime";
export class DefaultServiceContainer {
    descriptorByKey = new Map();
    singletons = new Map();
    add(descriptor) {
        this.descriptorByKey.set(this.keyId(descriptor.key), descriptor);
    }
    register(key, instance) {
        this.add({
            key,
            lifetime: ServiceLifetimes.Singleton,
            instance,
        });
    }
    descriptors() {
        return [...this.descriptorByKey.values()];
    }
    contains(key) {
        return this.descriptorByKey.has(key);
    }
    resolve(key) {
        const descriptor = this.descriptorByKey.get(key);
        if (!descriptor) {
            throw new Error(`Service not registered: ${String(key)}`);
        }
        if (descriptor.instance !== undefined) {
            return descriptor.instance;
        }
        const create = () => {
            if (descriptor.factory) {
                return descriptor.factory(this);
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
            return this.singletons.get(key);
        }
        return create();
    }
    keyId(key) {
        return typeof key === "symbol" ? key : key.id;
    }
}
