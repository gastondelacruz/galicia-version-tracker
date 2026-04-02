import {
  useAddStoryArtifact,
  useRemoveStoryArtifact,
  useStoryArtifacts,
} from "@/features/artifacts/hooks/use-artifacts";
import {
  useDeleteStory,
  useUpdateStory,
} from "@/features/stories/hooks/use-stories";
import { useUsers } from "@/features/users/hooks/use-users";
import { useToast } from "@/shared/hooks/use-toast";
import { Artifact, Person, Story } from "@/shared/types";
import { StoryFormData, storySchema } from "@/features/stories/validations/storySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type UseEditStoryDialogParams = {
  readonly story: Story;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

type UseEditStoryDialogReturn = {
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

export function useEditStoryDialog({
  story,
  open,
  onOpenChange,
}: UseEditStoryDialogParams): UseEditStoryDialogReturn {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const form = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      name: story.name,
      assignedTo: story.assigned_to,
      environment: story.environment as "dev" | "qas",
      type: story.type,
      artifacts: [],
    },
  });

  const { data: users = [] } = useUsers();
  const { data: existingArtifacts = [] } = useStoryArtifacts(story.id);
  const { mutate: updateStory, isPending: isUpdating } = useUpdateStory();
  const { mutate: deleteStory, isPending: isDeleting } = useDeleteStory();
  const { mutate: addArtifact } = useAddStoryArtifact();
  const { mutate: removeArtifact } = useRemoveStoryArtifact();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: story.name,
      assignedTo: story.assigned_to,
      environment: story.environment as "dev" | "qas",
      type: story.type,
      artifacts: existingArtifacts,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.id, open]);

  const handleSave = (data: StoryFormData): void => {
    updateStory(
      {
        id: story.id,
        updates: {
          name: data.name,
          assigned_to: data.assignedTo,
          environment: data.environment,
          type: data.type,
        },
      },
      {
        onSuccess: () => {
          const selected = data.artifacts as Artifact[];
          const toAdd = selected.filter(
            (a) => !existingArtifacts.some((e) => e.id === a.id),
          );
          const toRemove = existingArtifacts.filter(
            (e) => !selected.some((a) => a.id === e.id),
          );
          toAdd.forEach((a) =>
            addArtifact({ storyId: story.id, artifactId: a.id! }),
          );
          toRemove.forEach((a) =>
            removeArtifact({ storyId: story.id, artifactId: a.id! }),
          );
          toast({
            title: "Historia actualizada",
            description: "Los cambios se guardaron correctamente.",
          });
          onOpenChange(false);
        },
      },
    );
  };

  const handleDelete = (): void => {
    deleteStory(
      { storyId: story.id },
      {
        onSuccess: () => {
          toast({
            title: "Historia eliminada",
            description: "La historia se eliminó correctamente.",
            variant: "destructive",
          });
          onOpenChange(false);
          setShowDeleteAlert(false);
        },
      },
    );
  };

  const handleOpenChange = (value: boolean): void => {
    if (!value) setShowDeleteAlert(false);
    onOpenChange(value);
  };

  return {
    showDeleteAlert,
    setShowDeleteAlert,
    form,
    users,
    existingArtifacts,
    isUpdating,
    isDeleting,
    handleSave,
    handleDelete,
    handleOpenChange,
  };
}
