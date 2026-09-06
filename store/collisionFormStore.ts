import { deleteMediaBlob } from "@/lib/storage";
import { Collision, Media, Vehicle, Witness } from "@/lib/types";
import { create } from "zustand";
import { useVehicleStore } from "./vehicleStore";

interface CollisionFormStore {
  collision: Collision;
  isEdit: boolean;
  setEdit: (value: boolean) => void;
  updateCollisionField: <K extends keyof Collision>(
    key: K,
    value: Collision[K],
  ) => void;
  setForm: (collision: Collision) => void;
  upsertVehicle: (vehicle: Vehicle & { savePoint?: string }) => void;
  deleteVehicle: (id: string) => void;
  addWitness: (witness: Witness) => void;
  updateWitness: (witness: Witness) => void;
  deleteWitness: (id: string) => void;
  addMedia: (media: Omit<Media, "id">) => void;
  addMediaMany: (items: Omit<Media, "id">[]) => void;
  deleteMedia: (id: string) => void;
  resetForm: () => void;
}

const newLocation = () => ({
  description: "",
  coordinates: null,
});

const newCollision = (): Collision => {
  const { vehicle } = useVehicleStore.getState();
  return {
    id: crypto.randomUUID(),
    date: new Date(),
    location: newLocation(),
    description: "",
    vehicles: vehicle ? [vehicle] : [],
    witnesses: [],
    media: [],
    officer: null,
  };
};

export const useCollisionFormStore = create<CollisionFormStore>((set, get) => ({
  collision: newCollision(),
  isEdit: false,
  setEdit: (value) => set({ isEdit: value }),
  updateCollisionField: (key, value) =>
    set((state) => ({
      collision: { ...state.collision, [key]: value },
    })),
  setForm: (collision) => set({ collision }),
  deleteVehicle: (id: string) =>
    set((state) => ({
      collision: {
        ...state.collision,
        vehicles: state.collision.vehicles.filter((v) => v.id !== id),
      },
    })),
  upsertVehicle: (vehicle: Vehicle) => {
    const oldVehicles = get().collision.vehicles;
    const hasVehicle = oldVehicles.some((v) => v.id === vehicle.id);
    const newVehicles = hasVehicle
      ? oldVehicles.map((v) => (v.id === vehicle.id ? vehicle : v))
      : [...oldVehicles, vehicle];
    get().updateCollisionField("vehicles", newVehicles);
  },
  addWitness: (witness) =>
    set((state) => ({
      collision: {
        ...state.collision,
        witnesses: [...state.collision.witnesses, witness],
      },
    })),
  updateWitness: (witness: Witness) =>
    set((state) => ({
      collision: {
        ...state.collision,
        witnesses: state.collision.witnesses.map((w) =>
          w.id === witness.id ? witness : w,
        ),
      },
    })),
  deleteWitness: (id: string) =>
    set((state) => ({
      collision: {
        ...state.collision,
        witnesses: state.collision.witnesses.filter((w) => w.id !== id),
      },
    })),
  addMedia: (media) => get().addMediaMany([media]),
  addMediaMany: (items) => {
    if (items.length === 0) return;
    set((state) => ({
      collision: {
        ...state.collision,
        media: [
          ...items.map((item) => ({ id: crypto.randomUUID(), ...item })),
          ...state.collision.media,
        ],
      },
    }));
  },
  deleteMedia: (id: string) => {
    const media = get().collision.media.find((m) => m.id === id);
    if (media) {
      void deleteMediaBlob(media.uri);
      if (media.thumbnailUri) void deleteMediaBlob(media.thumbnailUri);
    }
    set((state) => ({
      collision: {
        ...state.collision,
        media: state.collision.media.filter((m) => m.id !== id),
      },
    }));
  },
  resetForm: () => set({ collision: newCollision(), isEdit: false }),
}));
