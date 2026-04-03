import { useSyncExternalStore } from "react";
import {
  createStore,
  type Mutate,
  type StateCreator,
  type StoreApi,
  type StoreMutatorIdentifier,
} from "zustand/vanilla";

export function createBoundStore<
  T,
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
>(initializer: StateCreator<T, [], Mos>) {
  const store = createStore<T, Mos>(initializer);

  const useStore = <U>(selector: (state: T) => U) =>
    useSyncExternalStore(
      store.subscribe,
      () => selector(store.getState()),
      () => selector(store.getInitialState()),
    );

  return {
    store: store as Mutate<StoreApi<T>, Mos>,
    useStore,
  };
}
