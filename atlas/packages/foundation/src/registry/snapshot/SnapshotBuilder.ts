import type { RegistryEntry } from "./RegistryEntry";
import type { RegistrySnapshot } from "./RegistrySnapshot";

export function createSnapshot<TKey,TValue>(
  entries: Iterable<readonly [TKey,TValue]>
): RegistrySnapshot<TKey,TValue> {
  const items: RegistryEntry<TKey,TValue>[]=[];
  for(const [key,value] of entries){
    items.push({key,value});
  }
  return {
    createdAt:new Date(),
    count:items.length,
    entries:items
  };
}
