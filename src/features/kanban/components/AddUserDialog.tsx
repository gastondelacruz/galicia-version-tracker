import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/features/kanban/hooks/use-stories";
import { toast } from "@/shared/hooks/use-toast";
import { Person } from "@/shared/types";
import { Check, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { useState } from "react";

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterName, setFilterName] = useState("");
  const [editingName, setEditingName] = useState("");

  const { data: users = [], isLoading } = useUsers();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser } = useDeleteUser();

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(filterName.toLowerCase()),
  );

  const nameExists = (name: string, excludeId?: string) =>
    users.some(
      (u) =>
        u.name.toLowerCase() === name.trim().toLowerCase() &&
        u.id !== excludeId,
    );

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (nameExists(trimmed)) {
      toast({
        title: "Error",
        description: `"${trimmed}" ya existe`,
        variant: "destructive",
      });
      return;
    }
    createUser(
      { name: trimmed },
      {
        onSuccess: () => {
          setNewName("");
          toast({ title: "Éxito", description: "Usuario creado" });
        },
        onError: () =>
          toast({
            title: "Error",
            description: "No se pudo crear",
            variant: "destructive",
          }),
      },
    );
  };

  const handleStartEdit = (user: Person) => {
    setEditingId(user.id);
    setEditingName(user.name);
  };

  const handleConfirmEdit = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    if (nameExists(trimmed, id)) {
      toast({
        title: "Error",
        description: `"${trimmed}" ya existe`,
        variant: "destructive",
      });
      return;
    }
    updateUser(
      { id, name: trimmed },
      {
        onSuccess: () => {
          setEditingId(null);
          toast({ title: "Éxito", description: "Usuario actualizado" });
        },
        onError: () =>
          toast({
            title: "Error",
            description: "No se pudo actualizar",
            variant: "destructive",
          }),
      },
    );
  };

  const handleDelete = (id: string, name: string) => {
    setDeletingId(id);
    deleteUser(id, {
      onSuccess: () => {
        setDeletingId(null);
        toast({ title: "Éxito", description: `"${name}" eliminado` });
      },
      onError: () => {
        setDeletingId(null);
        toast({
          title: "Error",
          description: "No se pudo eliminar",
          variant: "destructive",
        });
      },
    });
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setNewName("");
      setFilterName("");
      setEditingId(null);
      setEditingName("");
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-lg" variant="terciaryv2">
          <Users className="mr-2 h-5 w-5" />
          Usuarios
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Gestión de Usuarios</DialogTitle>
        </DialogHeader>

        {/* Nuevo usuario */}
        <p className="text-sm font-medium text-muted-foreground">
          Agregar Usuario nuevo
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Nombre del usuario"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button
            onClick={handleCreate}
            disabled={isCreating || !newName.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <hr className="border-border" />

        {users.length > 0 && (
          <>
            {/* Filtros */}
            <p className="text-sm font-medium text-muted-foreground">
              Filtros de listado
            </p>
            <Input
              placeholder="Buscar por nombre..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />

            {/* Listado */}
            <div className="max-h-[360px] overflow-y-auto space-y-1 mt-2">
              {isLoading && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Cargando...
                </p>
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {users.length === 0
                    ? "No hay usuarios creados aún."
                    : "No hay resultados."}
                </p>
              )}
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border bg-card"
                >
                  {editingId === user.id ? (
                    <>
                      <Input
                        className="h-7 text-sm flex-1"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmEdit(user.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleConfirmEdit(user.id)}
                        disabled={isUpdating}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm">{user.name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleStartEdit(user)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={deletingId === user.id}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
