export class DefaultModuleLoader {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    async load(_moduleId) {
        // implementation in G2.5+
    }
    async unload(_moduleId) {
        // implementation in G2.5+
    }
}
