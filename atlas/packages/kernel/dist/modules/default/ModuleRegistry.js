export class ModuleRegistry {
    modules = new Map();
    add(descriptor) {
        this.modules.set(descriptor.manifest.id, descriptor);
    }
    get(id) {
        return this.modules.get(id);
    }
    all() {
        return [...this.modules.values()];
    }
}
