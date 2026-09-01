import { CycleDetector } from "./CycleDetector";
import { ModuleVersionMatcher } from "./ModuleVersionMatcher";
import { TopologicalSorter } from "./TopologicalSorter";
export class ModuleDependencyResolver {
    cycles = new CycleDetector();
    sorter = new TopologicalSorter();
    versions = new ModuleVersionMatcher();
    resolve(modules) {
        const modulesById = new Map(modules.map(module => [module.manifest.id, module]));
        for (const module of modules) {
            for (const dependency of module.manifest.dependencies) {
                const target = modulesById.get(dependency.id);
                if (!dependency.optional && !target) {
                    throw new Error(`Module dependency not found: ${module.manifest.id} -> ${dependency.id}`);
                }
                if (target && !this.versions.isCompatible(dependency.version, target.manifest.version)) {
                    throw new Error(`Module dependency version incompatible: ${module.manifest.id} -> ${dependency.id} requires ${dependency.version} but found ${target.manifest.version}`);
                }
            }
        }
        if (this.cycles.hasCycle(modules)) {
            throw new Error("Module dependency cycle detected.");
        }
        return this.sorter.sort(modules);
    }
}
