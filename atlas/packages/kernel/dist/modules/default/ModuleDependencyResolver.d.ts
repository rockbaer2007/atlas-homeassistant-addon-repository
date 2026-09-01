import type { ModuleDescriptor } from "../manifest/ModuleDescriptor";
export declare class ModuleDependencyResolver {
    private readonly cycles;
    private readonly sorter;
    private readonly versions;
    resolve(modules: readonly ModuleDescriptor[]): readonly ModuleDescriptor[];
}
