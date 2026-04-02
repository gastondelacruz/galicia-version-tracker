import { useAddStoryArtifact } from "@/features/artifacts/hooks/use-artifacts";
import { useCreateStory } from "@/features/stories/hooks/use-stories";
import type { UseAddStoryDialogReturn } from "@/features/stories/types";
import { useUsers } from "@/features/users/hooks/use-users";
import { StoryFormData, storySchema } from "@/features/stories/validations/storySchema";
import { ARTIFACT_TYPE, STORY_ENVIRONMENT } from "@/shared/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function useAddStoryDialog(): UseAddStoryDialogReturn {
  const [open, setOpen] = useState(false);

  const form = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      name: "",
      assignedTo: "",
      environment: STORY_ENVIRONMENT.READY_TO_DEV,
      type: ARTIFACT_TYPE.FRONT,
      artifacts: [],
    },
  });

  const { data: users = [] } = useUsers();
  const { mutate: createStory, isPending: isUpdating } = useCreateStory();
  const { mutate: addStoryArtifact } = useAddStoryArtifact();

  const handleSave = (data: StoryFormData): void => {
    createStory(
      {
        story: {
          name: data.name,
          assigned_to: data.assignedTo,
          environment: data.environment,
          type: data.type,
        },
      },
      {
        onSuccess: (story) => {
          data.artifacts.forEach((a) =>
            addStoryArtifact({ storyId: story.id, artifactId: a.id! }),
          );
          form.reset();
          setOpen(false);
        },
      },
    );
  };

  const handleDialogOpenChange = (value: boolean): void => {
    setOpen(value);
    if (!value) form.reset();
  };

  return { open, handleDialogOpenChange, form, users, isUpdating, handleSave };
}
