import { useDroppable } from "@dnd-kit/core";

type KanbanColumnId =
  | "readyToDev"
  | "dev"
  | "readyToQas"
  | "qas"
  | "readyToProd";

type UseKanbanColumnParams = {
  readonly id: KanbanColumnId;
};

type UseKanbanColumnReturn = {
  readonly setNodeRef: (node: HTMLElement | null) => void;
  readonly isOver: boolean;
};

export function useKanbanColumn({
  id,
}: UseKanbanColumnParams): UseKanbanColumnReturn {
  const { setNodeRef, isOver } = useDroppable({ id });
  return { setNodeRef, isOver };
}
