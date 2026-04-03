import { subscribeWithSelector } from "zustand/middleware";
import { createBoundStore } from "@/hooks/createStoreHook";

interface IStoreState {
  bears: number;
}

interface IStoreActions {
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
  alert: () => void;
}

export type IStore = IStoreState & IStoreActions;

const { store, useStore } = createBoundStore(
  subscribeWithSelector<IStore>((set, get) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
    updateBears: (newBears: number) => set({ bears: newBears }),
    alert: () => {
      const bears = get().bears;
      console.log(bears);
    },
  })),
);

store.subscribe(
  (state) => state.bears,
  (state, preState) => {
    console.log("新数据:", state, "旧数据:", preState);
  },
);

export { store, useStore};
