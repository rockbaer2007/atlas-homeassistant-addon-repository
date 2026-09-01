import type { ModuleDescriptor } from "../manifest/ModuleDescriptor";
export declare class TopologicalSorter {
    sort(modules: readonly ModuleDescriptor[]): readonly ModuleDescriptor[];
}
