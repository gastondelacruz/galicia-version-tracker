import { useAddStoryArtifact } from "@/features/artifacts/hooks/use-artifacts";
import { useCreateStory } from "@/features/stories/hooks/use-stories";
import { useUsers } from "@/features/users/hooks/use-users";
import { StoryFormData, storySchema } from "@/features/stories/validations/storySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Person } from "@/shared/types";

type UseAddStoryDialogReturn = {
  readonly open: boolean;
  readonly handleDialogOpenChange: (open: boolean) => void;
  readonly form: ReturnType<typeof useForm<StoryFormData>>;
  readonly users: Person[];
  readonly isUpdating: boolean;
  readonly handleSave: (data: StoryFormData) => void;
};

export function useAddStoryDialog(): UseAddStoryDialogReturn {
  const [open, setOpen] = useState(false);

  const form = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      name: "",
      assignedTo: "",
      environment: "readyToDev",
      type: "FRONT",
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
