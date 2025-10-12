import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Person } from "../types";

interface KanbanStore {
  filteredUser: string | null;
  setFilter: (person: Person["id"] | null) => void;
}

export const useKanbanStore = create<KanbanStore>()(
  devtools(
    (set) => ({
      filteredUser: null,
      setFilter: (user) =>
        set({ filteredUser: user }, false, { type: "setFilter", user }),
    }),
    {
      name: "kanban-storage",
    }
  )
);
