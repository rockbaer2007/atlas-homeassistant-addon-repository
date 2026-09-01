import type { ModuleDescriptor } from "../manifest/ModuleDescriptor";
export declare class DependencyGraph {
    private readonly nodes;
    add(module: ModuleDescriptor): void;
    contains(id: string): boolean;
    modules(): readonly ModuleDescriptor[];
}
