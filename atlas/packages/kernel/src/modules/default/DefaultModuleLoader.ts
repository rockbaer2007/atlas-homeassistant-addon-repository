import { ModuleRegistry } from "./ModuleRegistry";
import type { ModuleLoader } from "../contracts/ModuleLoader";

export class DefaultModuleLoader implements ModuleLoader {

  constructor(private readonly registry: ModuleRegistry){}

  async load(_moduleId: string): Promise<void> {
    // implementation in G2.5+
  }

  async unload(_moduleId: string): Promise<void> {
    // implementation in G2.5+
  }
}
