import { useKanbanBoard } from "@/features/kanban/hooks/use-kanban-board";
import { closestCorners, DndContext } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { Loader } from "@/shared/components/ui/Loader";

export function KanbanBoard(): JSX.Element {
  const {
    storiesLoading,
    sensors,
    readyToDevStories,
    devStories,
    readyToQasStories,
    qasStories,
    readyToProdStories,
    handleDragEnd,
  } = useKanbanBoard();

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
