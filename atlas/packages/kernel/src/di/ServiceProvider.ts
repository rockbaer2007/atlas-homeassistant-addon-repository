import type { ServiceKey } from "./ServiceKey";

export interface ServiceProvider {
  get<T>(key: ServiceKey<T>): T;
  tryGet<T>(key: ServiceKey<T>): T | undefined;
}
