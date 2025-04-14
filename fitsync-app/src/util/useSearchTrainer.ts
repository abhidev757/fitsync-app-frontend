import { create } from "zustand";

interface TrainerSearchStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useTrainerSearchStore = create<TrainerSearchStore>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
