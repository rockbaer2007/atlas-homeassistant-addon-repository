import type { ModuleDescriptor } from "../manifest/ModuleDescriptor";
export declare class CycleDetector {
    hasCycle(modules: readonly ModuleDescriptor[]): boolean;
}
