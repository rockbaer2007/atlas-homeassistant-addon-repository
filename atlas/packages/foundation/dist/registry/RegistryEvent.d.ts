export type RegistryEventType = "registered" | "unregistered" | "cleared";
export interface RegistryEvent<TKey, TValue> {
    readonly type: RegistryEventType;
    readonly key?: TKey;
    readonly value?: TValue;
}
