import { create } from "zustand";
import { FieldWithRelations } from "@/src/types/domain";

type AppState = {
  selectedField: FieldWithRelations | null;
  setSelectedField: (field: FieldWithRelations | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedField: null,
  setSelectedField: (field) => set({ selectedField: field })
}));
