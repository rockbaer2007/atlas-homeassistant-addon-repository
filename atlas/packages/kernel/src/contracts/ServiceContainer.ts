import type { ServiceResolver } from "../container/ServiceResolver";
import type { ServiceCollection } from "../container/ServiceCollection";

export interface ServiceContainer extends ServiceCollection, ServiceResolver {
  register<T>(key: symbol, instance: T): void;
}
