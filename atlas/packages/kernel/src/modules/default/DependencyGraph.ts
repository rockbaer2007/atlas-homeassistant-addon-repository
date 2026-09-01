import type { ModuleDescriptor } from "../manifest/ModuleDescriptor";

export class DependencyGraph{
  private readonly nodes=new Map<string,ModuleDescriptor>();

  add(module:ModuleDescriptor){
    this.nodes.set(module.manifest.id,module);
  }

  contains(id:string){
    return this.nodes.has(id);
  }

  modules():readonly ModuleDescriptor[]{
    return [...this.nodes.values()];
  }
}
