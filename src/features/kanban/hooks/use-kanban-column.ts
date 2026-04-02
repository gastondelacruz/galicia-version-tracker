import type {
  UseKanbanColumnParams,
  UseKanbanColumnReturn,
} from "@/features/kanban/types";
import { useDroppable } from "@dnd-kit/core";

export function useKanbanColumn({
  id,
}: UseKanbanColumnParams): UseKanbanColumnReturn {
  const { setNodeRef, isOver } = useDroppable({ id });
  return { setNodeRef, isOver };
}
