import { Witness } from "@/lib/types";
import { create } from "zustand";

interface WitnessFormStore {
  witness: Witness;
  isEdit: boolean;
  isDialogVisible: boolean;
  setDialogVisible: (value: boolean) => void;
  updateWitnessField: <K extends keyof Witness>(key: K, value: Witness[K]) => void;
  setEdit: (value: boolean) => void;
  setForm: (witness: Witness) => void;
  resetForm: () => void;
}

const newWitness = (): Witness => ({
  id: crypto.randomUUID(),
  name: "",
  phoneNumber: "",
  address: "",
});

export const useWitnessFormStore = create<WitnessFormStore>((set) => ({
  witness: newWitness(),
  isEdit: false,
  isDialogVisible: false,
  setDialogVisible: (value) => set({ isDialogVisible: value }),
  setEdit: (value) => set({ isEdit: value }),
  updateWitnessField: (key, value) =>
    set((state) => ({
      witness: { ...state.witness, [key]: value },
    })),
  setForm: (witness) => set({ witness }),
  resetForm: () => set({ witness: newWitness(), isEdit: false }),
}));
