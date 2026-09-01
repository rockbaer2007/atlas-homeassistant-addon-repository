export class DependencyGraph {
    nodes = new Map();
    add(module) {
        this.nodes.set(module.manifest.id, module);
    }
    contains(id) {
        return this.nodes.has(id);
    }
    modules() {
        return [...this.nodes.values()];
    }
}
