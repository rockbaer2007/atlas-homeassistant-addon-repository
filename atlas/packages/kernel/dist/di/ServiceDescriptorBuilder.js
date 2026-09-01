export class ServiceDescriptorBuilder {
    key;
    lifetime;
    constructor(key, lifetime) {
        this.key = key;
        this.lifetime = lifetime;
    }
    implementation(type) {
        return { key: this.key, lifetime: this.lifetime, implementation: type };
    }
    factory(factory) {
        return { key: this.key, lifetime: this.lifetime, factory };
    }
    instance(instance) {
        return { key: this.key, lifetime: this.lifetime, instance };
    }
}
