import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

/*
 * create（）：存在三个参数，第一个参数为函数，第二个参数为布尔值
 * 第一个参数：(set、get、api)=>{…}
 * 第二个参数：true/false
 * 若第二个参数不传或者传false时，则调用修改状态的方法后得到的新状态将会和create方法原来的返回值进行融合；
 * 若第二个参数传true时，则调用修改状态的方法后得到的新状态将会直接覆盖create方法原来的返回值。
 */

interface IBearsState {
  bears: number;
};

interface IBearsActions {
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
  alert: () => void;
};

type IBearsStore = IBearsState & IBearsActions;

const store = create(
  subscribeWithSelector<IBearsStore>((set, get) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
    updateBears: (newBears: number) => set({ bears: newBears }),
    alert: () => {
      const bears = get().bears;
      console.log(bears);
    },
  }))
);

store.subscribe((state) => state.bears,
  (state, preState) => {
    console.log("新数据:", state, "旧数据:", preState);
  },
);

export default store;
