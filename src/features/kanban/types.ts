import type { Story, StoryEnvironment } from "@/shared/types";
import type { DragEndEvent, useSensors } from "@dnd-kit/core";

export type UseKanbanColumnParams = {
  readonly id: StoryEnvironment;
};

export type UseKanbanColumnReturn = {
  readonly setNodeRef: (node: HTMLElement | null) => void;
  readonly isOver: boolean;
};

export type UseDashboardReturn = {
  readonly loading: boolean;
  readonly handleLogout: () => Promise<void>;
};

export type UseKanbanBoardReturn = {
  readonly storiesLoading: boolean;
  readonly sensors: ReturnType<typeof useSensors>;
  readonly readyToDevStories: Story[];
  readonly devStories: Story[];
  readonly readyToQasStories: Story[];
  readonly qasStories: Story[];
  readonly readyToProdStories: Story[];
  readonly handleDragEnd: (event: DragEndEvent) => void;
};
