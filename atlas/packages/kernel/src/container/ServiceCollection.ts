import type { ServiceDescriptor } from "./ServiceDescriptor";

export interface ServiceCollection {
  add<T>(descriptor: ServiceDescriptor<T>): void;
  descriptors(): readonly ServiceDescriptor[];
}
