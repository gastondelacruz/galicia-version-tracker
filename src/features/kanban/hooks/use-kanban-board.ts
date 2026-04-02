import {
  useStoriesWithDetails,
  useUpdateStoryBasicInfo,
} from "@/features/stories/hooks/use-stories";
import { useKanbanStore } from "@/features/kanban/store/kanbanStore";
import {
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo } from "react";
import { Story } from "@/shared/types";

type Environment = "readyToDev" | "dev" | "readyToQas" | "qas" | "readyToProd";

type UseKanbanBoardReturn = {
  readonly storiesLoading: boolean;
  readonly sensors: ReturnType<typeof useSensors>;
  readonly readyToDevStories: Story[];
  readonly devStories: Story[];
  readonly readyToQasStories: Story[];
  readonly qasStories: Story[];
  readonly readyToProdStories: Story[];
  readonly handleDragEnd: (event: DragEndEvent) => void;
};

export function useKanbanBoard(): UseKanbanBoardReturn {
  const { data: allStories = [], isLoading: storiesLoading } =
    useStoriesWithDetails();
  const filteredUsers = useKanbanStore((state) => state.filteredUsers);
  const { mutate: updateStoryBasicInfo } = useUpdateStoryBasicInfo();

  const stories: Story[] = useMemo(() => {
    if (filteredUsers.length === 0) return allStories;
    return allStories.filter((story) =>
      filteredUsers.includes(story.assigned_to),
    );
  }, [allStories, filteredUsers]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
  );

  const readyToDevStories = stories.filter(
    (story) => story.environment === "readyToDev",
  );
  const devStories = stories.filter((story) => story.environment === "dev");
  const readyToQasStories = stories.filter(
    (story) => story.environment === "readyToQas",
  );
  const qasStories = stories.filter((story) => story.environment === "qas");
  const readyToProdStories = stories.filter(
    (story) => story.environment === "readyToProd",
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over) return;

    updateStoryBasicInfo({
      id: active.id as string,
      updates: { environment: over.id as Environment },
    });
  };

  return {
    storiesLoading,
    sensors,
    readyToDevStories,
    devStories,
    readyToQasStories,
    qasStories,
    readyToProdStories,
    handleDragEnd,
  };
}
