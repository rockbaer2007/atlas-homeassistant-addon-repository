import { ModuleRegistry } from "./ModuleRegistry";
import type { ModuleLoader } from "../contracts/ModuleLoader";
export declare class DefaultModuleLoader implements ModuleLoader {
    private readonly registry;
    constructor(registry: ModuleRegistry);
    load(_moduleId: string): Promise<void>;
    unload(_moduleId: string): Promise<void>;
}
