import type { ServiceCollection } from "../../container/ServiceCollection";

export interface ModuleContext {
  readonly services: ServiceCollection;
}
