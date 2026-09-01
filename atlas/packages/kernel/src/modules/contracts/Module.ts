import type { ModuleContext } from "./ModuleContext";

export interface Module {
  initialize(context: ModuleContext): Promise<void>;
}
