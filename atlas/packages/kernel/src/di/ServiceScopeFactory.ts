import type { ServiceScope } from "./ServiceScope";

export interface ServiceScopeFactory {
  createScope(): ServiceScope;
}
