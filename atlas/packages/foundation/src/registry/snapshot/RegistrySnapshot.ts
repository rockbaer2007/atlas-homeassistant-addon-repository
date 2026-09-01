import type { RegistryEntry } from "./RegistryEntry";

export type RegistrySnapshot<TKey,TValue> = Readonly<{
  createdAt: Date;
  count:number;
  entries: readonly RegistryEntry<TKey,TValue>[];
}>;
