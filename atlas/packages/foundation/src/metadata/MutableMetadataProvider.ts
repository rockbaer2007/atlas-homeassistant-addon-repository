import type { ReadonlyMetadataProvider } from "./ReadonlyMetadataProvider";
export interface MutableMetadataProvider extends ReadonlyMetadataProvider {
  set(key: string, value: unknown): void;
  remove(key: string): boolean;
  clear(): void;
}
