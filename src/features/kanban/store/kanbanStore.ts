import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Person } from "@/shared/types";

interface KanbanStore {
  filteredUsers: string[];
  setFilter: (users: Person["id"][]) => void;
}

export const useKanbanStore = create<KanbanStore>()(
  devtools(
    (set) => ({
      filteredUsers: [],
      setFilter: (users) =>
        set({ filteredUsers: users }, false, { type: "setFilter", users }),
    }),
    {
      name: "kanban-storage",
    }
  )
);
