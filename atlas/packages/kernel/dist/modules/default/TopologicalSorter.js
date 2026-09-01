export class TopologicalSorter {
    sort(modules) {
        const byId = new Map(modules.map(module => [module.manifest.id, module]));
        const visited = new Set();
        const sorted = [];
        const visit = (module) => {
            const id = module.manifest.id;
            if (visited.has(id)) {
                return;
            }
            visited.add(id);
            for (const dependency of module.manifest.dependencies) {
                const target = byId.get(dependency.id);
                if (target) {
                    visit(target);
                }
            }
            sorted.push(module);
        };
        for (const module of modules) {
            visit(module);
        }
        return sorted;
    }
}
