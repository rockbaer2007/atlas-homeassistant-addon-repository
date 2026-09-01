import type { ModuleDescriptor } from "../manifest/ModuleDescriptor";

export class ModuleRegistry {
  private readonly modules = new Map<string, ModuleDescriptor>();

  add(descriptor: ModuleDescriptor): void {
    this.modules.set(descriptor.manifest.id, descriptor);
  }

  get(id: string): ModuleDescriptor | undefined {
    return this.modules.get(id);
  }

  all(): readonly ModuleDescriptor[] {
    return [...this.modules.values()];
  }
}
