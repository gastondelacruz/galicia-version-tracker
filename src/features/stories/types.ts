import type { Artifact, Person, Story } from "@/shared/types";
import type { StoryFormData } from "@/features/stories/validations/storySchema";
import type { useForm } from "react-hook-form";
import type { useDraggable } from "@dnd-kit/core";
import type { CSSProperties } from "react";

export type UseAddStoryDialogReturn = {
  readonly open: boolean;
  readonly handleDialogOpenChange: (open: boolean) => void;
  readonly form: ReturnType<typeof useForm<StoryFormData>>;
  readonly users: Person[];
  readonly isUpdating: boolean;
  readonly handleSave: (data: StoryFormData) => void;
};

export type UseEditStoryDialogParams = {
  readonly story: Story;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export type UseEditStoryDialogReturn = {
  readonly showDeleteAlert: boolean;
  readonly setShowDeleteAlert: (v: boolean) => void;
  readonly form: ReturnType<typeof useForm<StoryFormData>>;
  readonly users: Person[];
  readonly existingArtifacts: Artifact[];
  readonly isUpdating: boolean;
  readonly isDeleting: boolean;
  readonly handleSave: (data: StoryFormData) => void;
  readonly handleDelete: () => void;
  readonly handleOpenChange: (value: boolean) => void;
};

export type UseStoryCardParams = {
  readonly story: Story;
};

export type UseStoryCardReturn = {
  readonly editOpen: boolean;
  readonly setEditOpen: (v: boolean) => void;
  readonly assignedUserName: string | undefined;
  readonly artifacts: Artifact[];
  readonly setNodeRef: (node: HTMLElement | null) => void;
  readonly style: CSSProperties | undefined;
  readonly listeners: ReturnType<typeof useDraggable>["listeners"];
  readonly attributes: ReturnType<typeof useDraggable>["attributes"];
};
