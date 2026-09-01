export class CycleDetector {
    hasCycle(modules) {
        const byId = new Map(modules.map(module => [module.manifest.id, module]));
        const visiting = new Set();
        const visited = new Set();
        const visit = (module) => {
            const id = module.manifest.id;
            if (visiting.has(id)) {
                return true;
            }
            if (visited.has(id)) {
                return false;
            }
            visiting.add(id);
            for (const dependency of module.manifest.dependencies) {
                const target = byId.get(dependency.id);
                if (target && visit(target)) {
                    return true;
                }
            }
            visiting.delete(id);
            visited.add(id);
            return false;
        };
        return modules.some(visit);
    }
}
