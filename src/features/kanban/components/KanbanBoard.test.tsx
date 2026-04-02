import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { KanbanBoard } from "./KanbanBoard";
import { Story } from "@/shared/types";
import type { ReactNode } from "react";
import { useKanbanStore } from "@/features/kanban/store/kanbanStore";

vi.mock("@dnd-kit/core", async () => {
  const actual = await vi.importActual<typeof import("@dnd-kit/core")>("@dnd-kit/core");
  return {
    ...actual,
    DndContext: ({ children }: { children: ReactNode }) => (
      <div data-testid="dnd-context">{children}</div>
    ),
    useSensor: vi.fn(() => ({})),
    useSensors: vi.fn(() => []),
    PointerSensor: class {},
    closestCorners: vi.fn(),
  };
});

const mockUpdateStoryBasicInfo = vi.fn();

vi.mock("@/features/stories/hooks/use-stories", () => ({
  useStoriesWithDetails: vi.fn(() => ({ data: [], isLoading: false })),
  useUpdateStoryBasicInfo: () => ({ mutate: mockUpdateStoryBasicInfo }),
}));

vi.mock("./KanbanColumn", () => ({
  KanbanColumn: ({
    id,
    title,
    stories,
    count,
  }: {
    id: string;
    title: string;
    stories: Story[];
    count: number;
  }) => (
    <div data-testid={`column-${id}`}>
      {title} ({count})
      {stories.map((s) => (
        <div key={s.id} data-testid={`story-in-${id}`}>
          {s.name}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/shared/components/ui/Loader", () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

const allStories: Story[] = [
  { id: "s1", name: "Story A", assigned_to: "u1", environment: "readyToDev", type: "FRONT", created_at: "2024-01-01" },
  { id: "s2", name: "Story B", assigned_to: "u2", environment: "dev", type: "BACK", created_at: "2024-01-02" },
  { id: "s3", name: "Story C", assigned_to: "u1", environment: "readyToQas", type: "FRONT", created_at: "2024-01-03" },
  { id: "s4", name: "Story D", assigned_to: "u2", environment: "qas", type: "BACK", created_at: "2024-01-04" },
  { id: "s5", name: "Story E", assigned_to: "u1", environment: "readyToProd", type: "FRONT", created_at: "2024-01-05" },
];

describe("KanbanBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useKanbanStore.setState({ filteredUsers: [] });
  });

  describe("loading state", () => {
    it("renders the Loader when stories are loading", async () => {
      const { useStoriesWithDetails } = await import("@/features/stories/hooks/use-stories");
      vi.mocked(useStoriesWithDetails).mockReturnValue({ data: [], isLoading: true } as ReturnType<typeof useStoriesWithDetails>);
      render(<KanbanBoard />);
      expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("does not render the Loader when stories are loaded", async () => {
      const { useStoriesWithDetails } = await import("@/features/stories/hooks/use-stories");
      vi.mocked(useStoriesWithDetails).mockReturnValue({ data: [], isLoading: false } as ReturnType<typeof useStoriesWithDetails>);
      render(<KanbanBoard />);
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });
  });

  describe("column rendering", () => {
    beforeEach(async () => {
      const { useStoriesWithDetails } = await import("@/features/stories/hooks/use-stories");
      vi.mocked(useStoriesWithDetails).mockReturnValue({ data: allStories, isLoading: false } as ReturnType<typeof useStoriesWithDetails>);
    });

    it("renders all 5 kanban columns", () => {
      render(<KanbanBoard />);
      expect(screen.getByTestId("column-readyToDev")).toBeInTheDocument();
      expect(screen.getByTestId("column-dev")).toBeInTheDocument();
      expect(screen.getByTestId("column-readyToQas")).toBeInTheDocument();
      expect(screen.getByTestId("column-qas")).toBeInTheDocument();
      expect(screen.getByTestId("column-readyToProd")).toBeInTheDocument();
    });

    it("renders correct column titles", () => {
      render(<KanbanBoard />);
      expect(screen.getByTestId("column-readyToDev")).toHaveTextContent("Listo para Dev");
      expect(screen.getByTestId("column-dev")).toHaveTextContent("DEV");
      expect(screen.getByTestId("column-readyToQas")).toHaveTextContent("Listo para QAS");
      expect(screen.getByTestId("column-qas")).toHaveTextContent("QAS");
      expect(screen.getByTestId("column-readyToProd")).toHaveTextContent("Listo para Prod");
    });

    it("distributes stories into the correct columns by environment", () => {
      render(<KanbanBoard />);
      expect(screen.getByTestId("column-readyToDev")).toHaveTextContent("Story A");
      expect(screen.getByTestId("column-dev")).toHaveTextContent("Story B");
      expect(screen.getByTestId("column-readyToQas")).toHaveTextContent("Story C");
      expect(screen.getByTestId("column-qas")).toHaveTextContent("Story D");
      expect(screen.getByTestId("column-readyToProd")).toHaveTextContent("Story E");
    });
  });

  describe("user filter", () => {
    beforeEach(async () => {
      const { useStoriesWithDetails } = await import("@/features/stories/hooks/use-stories");
      vi.mocked(useStoriesWithDetails).mockReturnValue({ data: allStories, isLoading: false } as ReturnType<typeof useStoriesWithDetails>);
    });

    it("shows all stories when no filter is active", () => {
      render(<KanbanBoard />);
      expect(screen.getByTestId("column-readyToDev")).toHaveTextContent("Story A");
      expect(screen.getByTestId("column-dev")).toHaveTextContent("Story B");
    });

    it("shows only stories assigned to the filtered user", () => {
      useKanbanStore.setState({ filteredUsers: ["u1"] });
      render(<KanbanBoard />);
      // u1 has stories A (readyToDev), C (readyToQas), E (readyToProd)
      expect(screen.getByTestId("column-readyToDev")).toHaveTextContent("Story A");
      expect(screen.getByTestId("column-readyToQas")).toHaveTextContent("Story C");
      expect(screen.getByTestId("column-readyToProd")).toHaveTextContent("Story E");
      // u2's stories should not appear
      expect(screen.getByTestId("column-dev")).not.toHaveTextContent("Story B");
      expect(screen.getByTestId("column-qas")).not.toHaveTextContent("Story D");
    });

    it("shows stories from multiple filtered users", () => {
      useKanbanStore.setState({ filteredUsers: ["u1", "u2"] });
      render(<KanbanBoard />);
      expect(screen.getByTestId("column-readyToDev")).toHaveTextContent("Story A");
      expect(screen.getByTestId("column-dev")).toHaveTextContent("Story B");
    });
  });
});
