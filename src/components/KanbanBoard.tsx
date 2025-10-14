import {
  useStoriesWithDetails,
  useUpdateStoryBasicInfo,
} from "@/hooks/use-stories";
import { useKanbanStore } from "@/store/kanbanStore";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { Loader } from "./ui/Loader";

export function KanbanBoard() {
  const { data: allStories = [], isLoading: storiesLoading } =
    useStoriesWithDetails();
  const filteredUser = useKanbanStore((state) => state.filteredUser);
  const { mutate: updateStoryBasicInfo } = useUpdateStoryBasicInfo();

  const stories = useMemo(() => {
    if (!filteredUser) return allStories;
    return allStories.filter((story) => story.assigned_to === filteredUser);
  }, [allStories, filteredUser]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const readyToDevStories = stories.filter(
    (story) => story.environment === "readyToDev"
  );
  const devStories = stories.filter((story) => story.environment === "dev");
  const readyToQasStories = stories.filter(
    (story) => story.environment === "readyToQas"
  );
  const qasStories = stories.filter((story) => story.environment === "qas");
  const readyToProdStories = stories.filter(
    (story) => story.environment === "readyToProd"
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const storyId = active.id as string;
    const newEnvironment = over.id as
      | "readyToDev"
      | "dev"
      | "readyToQas"
      | "qas"
      | "readyToProd";

    updateStoryBasicInfo({
      id: storyId,
      updates: {
        environment: newEnvironment,
      },
    });
  };

  if (storiesLoading) {
    return <Loader />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col md:flex-row md:items-stretch gap-4">
        <KanbanColumn
          id="readyToDev"
          title="Listo para Dev"
          stories={readyToDevStories}
          count={readyToDevStories.length}
        />
        <KanbanColumn
          id="dev"
          title="DEV"
          stories={devStories}
          count={devStories.length}
        />
        <KanbanColumn
          id="readyToQas"
          title="Listo para QAS"
          stories={readyToQasStories}
          count={readyToQasStories.length}
        />
        <KanbanColumn
          id="qas"
          title="QAS"
          stories={qasStories}
          count={qasStories.length}
        />
        <KanbanColumn
          id="readyToProd"
          title="Listo para Prod"
          stories={readyToProdStories}
          count={readyToProdStories.length}
        />
      </div>
    </DndContext>
  );
}
