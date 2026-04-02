import {
  useStoriesWithDetails,
  useUpdateStoryBasicInfo,
} from "@/features/stories/hooks/use-stories";
import type { UseKanbanBoardReturn } from "@/features/kanban/types";
import { useKanbanStore } from "@/features/kanban/store/kanbanStore";
import {
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo } from "react";
import { STORY_ENVIRONMENT } from "@/shared/types";
import type { Story, StoryEnvironment } from "@/shared/types";

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
    (story) => story.environment === STORY_ENVIRONMENT.READY_TO_DEV,
  );
  const devStories = stories.filter(
    (story) => story.environment === STORY_ENVIRONMENT.DEV,
  );
  const readyToQasStories = stories.filter(
    (story) => story.environment === STORY_ENVIRONMENT.READY_TO_QAS,
  );
  const qasStories = stories.filter(
    (story) => story.environment === STORY_ENVIRONMENT.QAS,
  );
  const readyToProdStories = stories.filter(
    (story) => story.environment === STORY_ENVIRONMENT.READY_TO_PROD,
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over) return;

    updateStoryBasicInfo({
      id: active.id as string,
      updates: { environment: over.id as StoryEnvironment },
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
