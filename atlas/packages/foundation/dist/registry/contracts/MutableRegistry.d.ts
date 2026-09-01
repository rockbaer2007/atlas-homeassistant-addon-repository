import type { ReadonlyRegistry } from "./ReadonlyRegistry";
export interface MutableRegistry<TKey, TValue> extends ReadonlyRegistry<TKey, TValue> {
    register(key: TKey, value: TValue): void;
    unregister(key: TKey): boolean;
    clear(): void;
}
