import { FILTER_ALL } from "@/shared/constants/businessRules";
import type { Artifact, ArtifactType } from "@/shared/types";

export type ArtifactFilterType = typeof FILTER_ALL | ArtifactType;

export type UseAddArtifactDialogReturn = {
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

export type UseArtifactSelectorParams = {
  readonly selected: Artifact[];
  readonly onChange: (artifacts: Artifact[]) => void;
};

export type UseArtifactSelectorReturn = {
  readonly search: string;
  readonly setSearch: (v: string) => void;
  readonly filtered: Artifact[];
  readonly handleAdd: (artifact: Artifact) => void;
  readonly handleRemove: (id: string) => void;
};
