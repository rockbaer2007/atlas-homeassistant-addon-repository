export interface Lookup<TKey, TValue> {
    has(key: TKey): boolean;
    get(key: TKey): TValue | undefined;
}
