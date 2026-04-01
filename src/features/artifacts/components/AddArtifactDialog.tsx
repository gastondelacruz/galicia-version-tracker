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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useArtifacts,
  useCreateArtifact,
  useDeleteArtifact,
  useUpdateArtifact,
} from "@/features/artifacts/hooks/use-artifacts";
import { toast } from "@/shared/hooks/use-toast";
import { Artifact } from "@/shared/types";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

export function AddArtifactDialog() {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"FRONT" | "BACK">("BACK");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "FRONT" | "BACK">("ALL");
  const [editingName, setEditingName] = useState("");
  const [editingType, setEditingType] = useState<"FRONT" | "BACK">("BACK");

  const { data: artifacts = [], isLoading } = useArtifacts();
  const { mutate: createArtifact, isPending: isCreating } =
    useCreateArtifact();
  const { mutate: updateArtifact, isPending: isUpdating } =
    useUpdateArtifact();
  const { mutate: deleteArtifact } = useDeleteArtifact();

  const filteredArtifacts = artifacts.filter((a) => {
    const matchesName = a.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesType = filterType === "ALL" || a.type === filterType;
    return matchesName && matchesType;
  });

  const nameExists = (name: string, excludeId?: string) =>
    artifacts.some(
      (a) =>
        a.name.toLowerCase() === name.trim().toLowerCase() &&
        a.id !== excludeId,
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
    createArtifact(
      { name: trimmed, type: newType },
      {
        onSuccess: () => {
          setNewName("");
          setNewType("BACK");
          toast({ title: "Éxito", description: "Artefacto creado" });
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

  const handleStartEdit = (artifact: Artifact) => {
    setEditingId(artifact.id!);
    setEditingName(artifact.name);
    setEditingType(artifact.type);
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
    updateArtifact(
      { id, name: trimmed, type: editingType },
      {
        onSuccess: () => {
          setEditingId(null);
          toast({ title: "Éxito", description: "Artefacto actualizado" });
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
    deleteArtifact(id, {
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
      setNewType("BACK");
      setFilterName("");
      setFilterType("ALL");
      setEditingId(null);
      setEditingName("");
      setEditingType("BACK");
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-lg" variant="terciary">
          <Pencil className="mr-2 h-5 w-5" />
          Artefactos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Gestión de Artefactos</DialogTitle>
        </DialogHeader>

        {/* Nuevo artefacto */}
        <p className="text-sm font-medium text-muted-foreground">
          Agregar Artefacto nuevo
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Nombre del artefacto"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Select
            value={newType}
            onValueChange={(v) => setNewType(v as "FRONT" | "BACK")}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FRONT">FRONT</SelectItem>
              <SelectItem value="BACK">BACK</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !newName.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <hr className="border-border" />

        {artifacts.length > 0 && (
          <>
            {/* Filtros */}
            <p className="text-sm font-medium text-muted-foreground">
              Filtros de listado
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nombre..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
              <Select
                value={filterType}
                onValueChange={(v) =>
                  setFilterType(v as "ALL" | "FRONT" | "BACK")
                }
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="FRONT">FRONT</SelectItem>
                  <SelectItem value="BACK">BACK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listado */}
            <div className="max-h-[360px] overflow-y-auto space-y-1 mt-2">
              {isLoading && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Cargando...
                </p>
              )}
              {!isLoading && filteredArtifacts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {artifacts.length === 0
                    ? "No hay artefactos creados aún."
                    : "No hay resultados."}
                </p>
              )}
              {filteredArtifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border bg-card"
                >
                  {editingId === artifact.id ? (
                    <>
                      <Input
                        className="h-7 text-sm flex-1"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleConfirmEdit(artifact.id!);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                      />
                      <Select
                        value={editingType}
                        onValueChange={(v) =>
                          setEditingType(v as "FRONT" | "BACK")
                        }
                      >
                        <SelectTrigger className="h-7 w-[100px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FRONT">FRONT</SelectItem>
                          <SelectItem value="BACK">BACK</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleConfirmEdit(artifact.id!)}
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
                      <span className="flex-1 text-sm">{artifact.name}</span>
                      <span className="text-xs text-muted-foreground w-10">
                        {artifact.type}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleStartEdit(artifact)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() =>
                          handleDelete(artifact.id!, artifact.name)
                        }
                        disabled={deletingId === artifact.id}
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
