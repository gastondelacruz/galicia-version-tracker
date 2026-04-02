import { useStoryArtifacts } from "@/features/artifacts/hooks/use-artifacts";
import type {
  UseStoryCardParams,
  UseStoryCardReturn,
} from "@/features/stories/types";
import { useUsers } from "@/features/users/hooks/use-users";
import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import { CSSProperties } from "react";

export function useStoryCard({
  story,
}: UseStoryCardParams): UseStoryCardReturn {
  const [editOpen, setEditOpen] = useState(false);

  const { data: users = [] } = useUsers();
  const { data: artifacts = [] } = useStoryArtifacts(story.id);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: story.id });

  const assignedUserName = users.find(
    (user) => user.id === story.assigned_to,
  )?.name;

  const style: CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return {
    editOpen,
    setEditOpen,
    assignedUserName,
    artifacts,
    setNodeRef,
    style,
    listeners,
    attributes,
  };
}
