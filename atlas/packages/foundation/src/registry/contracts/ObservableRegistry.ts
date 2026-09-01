import type { RegistryEvent } from "../RegistryEvent";
import type { MutableRegistry } from "./MutableRegistry";

export interface ObservableRegistry<TKey, TValue>
  extends MutableRegistry<TKey, TValue> {

  subscribe(
    listener: (event: RegistryEvent<TKey, TValue>) => void
  ): () => void;
}
