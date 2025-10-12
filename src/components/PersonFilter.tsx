import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/use-stories";
import { useKanbanStore } from "@/store/kanbanStore";
import { X } from "lucide-react";

export function PersonFilter() {
  const filteredUser = useKanbanStore((state) => state.filteredUser);
  const setFilter = useKanbanStore((state) => state.setFilter);

  const { data: users = [] } = useUsers();

  return (
    <div className="flex items-center gap-2">
      <Select
        value={filteredUser || "all"}
        onValueChange={(value) => setFilter(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrar por persona" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las personas</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {filteredUser && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFilter(null)}
          title="Limpiar filtro"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
