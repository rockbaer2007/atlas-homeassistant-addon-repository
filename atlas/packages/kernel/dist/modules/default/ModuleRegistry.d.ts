import type { ModuleDescriptor } from "../manifest/ModuleDescriptor";
export declare class ModuleRegistry {
    private readonly modules;
    add(descriptor: ModuleDescriptor): void;
    get(id: string): ModuleDescriptor | undefined;
    all(): readonly ModuleDescriptor[];
}
