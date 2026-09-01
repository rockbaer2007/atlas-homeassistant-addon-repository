export interface ModuleLoader {
  load(moduleId: string): Promise<void>;
  unload(moduleId: string): Promise<void>;
}
