import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { zustandAsyncStorage } from "../../utils/zustandAsyncStorage";

export interface CountState {
  count: number;
  patrial: number;
}

export interface CountAction {
  addOne: () => void;
  minusOne: () => void;
  add: (value: number) => void;
  minus: (value: number) => void;
}

export type CountStore = CountState & CountAction;

const initialState: CountState = {
  count: 0,
  patrial: 0,
};

const countStoreCreator: StateCreator<
  CountStore,
  [["zustand/immer", never]],
  [["zustand/persist", unknown]]
> = (set) => {
  return {
    ...initialState,
    addOne: () =>
      set((state) => {
        state.count += 1;
      }),
    minusOne: () =>
      set((state) => {
        state.count -= 1;
      }),
    add: (value: number) =>
      set((state) => {
        state.count += value;
      }),
    minus: (value: number) =>
      set((state) => {
        state.count -= value;
      }),
  };
};

export const countStore = create<CountStore>()(
  persist(immer(countStoreCreator), {
    name: "count-store",
    storage: zustandAsyncStorage,
    partialize: (state) => ({
      count: state.count,
    }),
  })
);
