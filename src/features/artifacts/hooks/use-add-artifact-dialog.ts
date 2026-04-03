import {
  useArtifacts,
  useCreateArtifact,
  useDeleteArtifact,
  useUpdateArtifact,
} from "@/features/artifacts/hooks/use-artifacts";
import type {
  ArtifactFilterType,
  UseAddArtifactDialogReturn,
} from "@/features/artifacts/types";
import { FILTER_ALL } from "@/shared/constants/businessRules";
import { toast } from "@/shared/hooks/use-toast";
import { ARTIFACT_TYPE } from "@/shared/types";
import type { Artifact, ArtifactType } from "@/shared/types";
import { useState } from "react";

export function useAddArtifactDialog(): UseAddArtifactDialogReturn {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<ArtifactType>(ARTIFACT_TYPE.BACK);
  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState<ArtifactFilterType>(FILTER_ALL);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingType, setEditingType] = useState<ArtifactType>(ARTIFACT_TYPE.BACK);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: artifacts = [], isLoading } = useArtifacts();
  const { mutate: createArtifact, isPending: isCreating } = useCreateArtifact();
  const { mutate: updateArtifact, isPending: isUpdating } = useUpdateArtifact();
  const { mutate: deleteArtifact } = useDeleteArtifact();

  const filteredArtifacts = artifacts.filter((a) => {
    const matchesName = a.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesType = filterType === FILTER_ALL || a.type === filterType;
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
          setNewType(ARTIFACT_TYPE.BACK);
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
      setNewType(ARTIFACT_TYPE.BACK);
      setFilterName("");
      setFilterType(FILTER_ALL);
      setEditingId(null);
      setEditingName("");
      setEditingType(ARTIFACT_TYPE.BACK);
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
