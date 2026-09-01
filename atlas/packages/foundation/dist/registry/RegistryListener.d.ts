import type { RegistryEvent } from "./RegistryEvent";
export type RegistryListener<TKey, TValue> = (event: RegistryEvent<TKey, TValue>) => void;
