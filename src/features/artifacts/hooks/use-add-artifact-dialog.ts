import {
  useArtifacts,
  useCreateArtifact,
  useDeleteArtifact,
  useUpdateArtifact,
} from "@/features/artifacts/hooks/use-artifacts";
import { toast } from "@/shared/hooks/use-toast";
import { Artifact } from "@/shared/types";
import { useState } from "react";

type ArtifactType = Artifact["type"];
type ArtifactFilterType = "ALL" | ArtifactType;

type UseAddArtifactDialogReturn = {
  // Dialog
  readonly open: boolean;
  readonly onOpenChange: (value: boolean) => void;
  // Create
  readonly newName: string;
  readonly newType: ArtifactType;
  readonly isCreating: boolean;
  readonly setNewName: (v: string) => void;
  readonly setNewType: (v: ArtifactType) => void;
  readonly handleCreate: () => void;
  // Filter
  readonly filterName: string;
  readonly filterType: ArtifactFilterType;
  readonly setFilterName: (v: string) => void;
  readonly setFilterType: (v: ArtifactFilterType) => void;
  readonly filteredArtifacts: Artifact[];
  // Edit
  readonly editingId: string | null;
  readonly editingName: string;
  readonly editingType: ArtifactType;
  readonly isUpdating: boolean;
  readonly setEditingId: (id: string | null) => void;
  readonly setEditingName: (v: string) => void;
  readonly setEditingType: (v: ArtifactType) => void;
  readonly handleStartEdit: (artifact: Artifact) => void;
  readonly handleConfirmEdit: (id: string) => void;
  // Delete
  readonly deletingId: string | null;
  readonly handleDelete: (id: string, name: string) => void;
  // Data
  readonly artifacts: Artifact[];
  readonly isLoading: boolean;
};

export function useAddArtifactDialog(): UseAddArtifactDialogReturn {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<ArtifactType>("BACK");
  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState<ArtifactFilterType>("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingType, setEditingType] = useState<ArtifactType>("BACK");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: artifacts = [], isLoading } = useArtifacts();
  const { mutate: createArtifact, isPending: isCreating } = useCreateArtifact();
  const { mutate: updateArtifact, isPending: isUpdating } = useUpdateArtifact();
  const { mutate: deleteArtifact } = useDeleteArtifact();

  const filteredArtifacts = artifacts.filter((a) => {
    const matchesName = a.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesType = filterType === "ALL" || a.type === filterType;
    return matchesName && matchesType;
  });

  const nameExists = (name: string, excludeId?: string): boolean =>
    artifacts.some(
      (a) =>
        a.name.toLowerCase() === name.trim().toLowerCase() &&
        a.id !== excludeId,
    );

  const handleCreate = (): void => {
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

  const handleStartEdit = (artifact: Artifact): void => {
    setEditingId(artifact.id!);
    setEditingName(artifact.name);
    setEditingType(artifact.type);
  };

  const handleConfirmEdit = (id: string): void => {
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

  const handleDelete = (id: string, name: string): void => {
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

  const onOpenChange = (value: boolean): void => {
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

  return {
    open,
    onOpenChange,
    newName,
    newType,
    isCreating,
    setNewName,
    setNewType,
    handleCreate,
    filterName,
    filterType,
    setFilterName,
    setFilterType,
    filteredArtifacts,
    editingId,
    editingName,
    editingType,
    isUpdating,
    setEditingId,
    setEditingName,
    setEditingType,
    handleStartEdit,
    handleConfirmEdit,
    deletingId,
    handleDelete,
    artifacts,
    isLoading,
  };
}
