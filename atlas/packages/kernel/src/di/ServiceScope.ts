import type { ServiceProvider } from "./ServiceProvider";

export interface ServiceScope {
  readonly provider: ServiceProvider;
  dispose(): void;
}
