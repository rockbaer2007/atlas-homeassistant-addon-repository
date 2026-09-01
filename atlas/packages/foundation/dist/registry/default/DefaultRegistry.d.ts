import type { Subscription } from "../../capabilities/Subscription";
import type { ObservableRegistry } from "../contracts/ObservableRegistry";
import type { RegistryListener } from "../RegistryListener";
export declare class DefaultRegistry<TKey, TValue> implements ObservableRegistry<TKey, TValue> {
    private readonly items;
    private readonly listeners;
    get size(): number;
    has(key: TKey): boolean;
    get(key: TKey): TValue | undefined;
    keys(): Iterable<TKey>;
    values(): Iterable<TValue>;
    entries(): Iterable<readonly [TKey, TValue]>;
    register(key: TKey, value: TValue): void;
    unregister(key: TKey): boolean;
    clear(): void;
    subscribe(listener: RegistryListener<TKey, TValue>): Subscription;
    private emit;
}
