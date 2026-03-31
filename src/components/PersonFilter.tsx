import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUsers } from "@/hooks/use-stories";
import { useKanbanStore } from "@/store/kanbanStore";
import { ChevronDown, X } from "lucide-react";

export function PersonFilter() {
  const filteredUsers = useKanbanStore((state) => state.filteredUsers);
  const setFilter = useKanbanStore((state) => state.setFilter);

  const { data: users = [] } = useUsers();

  const toggle = (id: string) => {
    if (filteredUsers.includes(id)) {
      setFilter(filteredUsers.filter((u) => u !== id));
    } else {
      setFilter([...filteredUsers, id]);
    }
  };

  const label =
    filteredUsers.length === 0
      ? "Todas las personas"
      : filteredUsers.length === 1
        ? (users.find((u) => u.id === filteredUsers[0])?.name ?? "1 persona")
        : `${filteredUsers.length} personas`;

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[200px] justify-between font-normal"
          >
            <span className="truncate">{label}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-400 cursor-pointer"
              onClick={() => toggle(user.id)}
            >
              <Checkbox
                checked={filteredUsers.includes(user.id)}
                onCheckedChange={() => toggle(user.id)}
              />
              <span className="text-sm">{user.name}</span>
            </div>
          ))}
        </PopoverContent>
      </Popover>
      {filteredUsers.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFilter([])}
          title="Limpiar filtro"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
