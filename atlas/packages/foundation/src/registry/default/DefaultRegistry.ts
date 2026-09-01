import type { Subscription } from "../../capabilities/Subscription";
import type { ObservableRegistry } from "../contracts/ObservableRegistry";
import type { RegistryEvent } from "../RegistryEvent";
import type { RegistryListener } from "../RegistryListener";

export class DefaultRegistry<TKey, TValue> implements ObservableRegistry<TKey, TValue> {
  private readonly items = new Map<TKey, TValue>();
  private readonly listeners = new Set<RegistryListener<TKey, TValue>>();

  get size(): number { return this.items.size; }

  has(key: TKey): boolean { return this.items.has(key); }

  get(key: TKey): TValue | undefined { return this.items.get(key); }

  keys(): Iterable<TKey> { return this.items.keys(); }

  values(): Iterable<TValue> { return this.items.values(); }

  entries(): Iterable<readonly [TKey, TValue]> { return this.items.entries(); }

  register(key: TKey, value: TValue): void {
    this.items.set(key, value);
    this.emit({ type: "registered", key, value });
  }

  unregister(key: TKey): boolean {
    const value = this.items.get(key);
    const removed = this.items.delete(key);
    if (removed) this.emit({ type: "unregistered", key, value });
    return removed;
  }

  clear(): void {
    if (this.items.size === 0) return;
    this.items.clear();
    this.emit({ type: "cleared" });
  }

  subscribe(listener: RegistryListener<TKey, TValue>): Subscription {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: RegistryEvent<TKey, TValue>): void {
    for (const l of this.listeners) l(event);
  }
}
