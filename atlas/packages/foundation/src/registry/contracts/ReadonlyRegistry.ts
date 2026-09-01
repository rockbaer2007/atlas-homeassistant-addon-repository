import type { Lookup } from "./Lookup";

export interface ReadonlyRegistry<TKey,TValue> extends Lookup<TKey,TValue> {
  readonly size: number;
  keys(): Iterable<TKey>;
  values(): Iterable<TValue>;
  entries(): Iterable<readonly [TKey,TValue]>;
}
