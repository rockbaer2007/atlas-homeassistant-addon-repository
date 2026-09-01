import type { RegistrySnapshot } from "./RegistrySnapshot";
export declare function createSnapshot<TKey, TValue>(entries: Iterable<readonly [TKey, TValue]>): RegistrySnapshot<TKey, TValue>;
