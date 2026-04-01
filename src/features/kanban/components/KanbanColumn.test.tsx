import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { KanbanColumn } from "./KanbanColumn";
import { Story } from "@/shared/types";

vi.mock("@dnd-kit/core", async () => {
  const actual = await vi.importActual<typeof import("@dnd-kit/core")>("@dnd-kit/core");
  return {
    ...actual,
    useDroppable: () => ({
      setNodeRef: vi.fn(),
      isOver: false,
    }),
  };
});

vi.mock("@/features/stories/components/StoryCard", () => ({
  StoryCard: ({ story }: { story: Story }) => (
    <div data-testid={`story-card-${story.id}`}>{story.name}</div>
  ),
}));

const mockStories: Story[] = [
  {
    id: "s1",
    name: "Historia uno",
    assigned_to: "u1",
    environment: "dev",
    type: "FRONT",
    created_at: "2024-01-01",
  },
  {
    id: "s2",
    name: "Historia dos",
    assigned_to: "u2",
    environment: "dev",
    type: "BACK",
    created_at: "2024-01-02",
  },
];

describe("KanbanColumn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the column title in uppercase", () => {
      render(
        <KanbanColumn id="dev" title="DEV" stories={[]} count={0} />,
      );
      expect(screen.getByText("DEV")).toBeInTheDocument();
    });

    it("renders the story count badge", () => {
      render(
        <KanbanColumn id="dev" title="DEV" stories={mockStories} count={2} />,
      );
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("renders a StoryCard for each story", () => {
      render(
        <KanbanColumn id="dev" title="DEV" stories={mockStories} count={2} />,
      );
      expect(screen.getByTestId("story-card-s1")).toBeInTheDocument();
      expect(screen.getByTestId("story-card-s2")).toBeInTheDocument();
    });

    it("renders story names via StoryCard", () => {
      render(
        <KanbanColumn id="dev" title="DEV" stories={mockStories} count={2} />,
      );
      expect(screen.getByText("Historia uno")).toBeInTheDocument();
      expect(screen.getByText("Historia dos")).toBeInTheDocument();
    });

    it("shows the empty state message when there are no stories", () => {
      render(
        <KanbanColumn id="dev" title="DEV" stories={[]} count={0} />,
      );
      expect(screen.getByText("Arrastra historias aquí")).toBeInTheDocument();
    });

    it("does not show the empty state message when there are stories", () => {
      render(
        <KanbanColumn id="dev" title="DEV" stories={mockStories} count={2} />,
      );
      expect(
        screen.queryByText("Arrastra historias aquí"),
      ).not.toBeInTheDocument();
    });
  });

  describe("all column ids", () => {
    const columns = [
      { id: "readyToDev", title: "Listo para Dev" },
      { id: "dev", title: "DEV" },
      { id: "readyToQas", title: "Listo para QAS" },
      { id: "qas", title: "QAS" },
      { id: "readyToProd", title: "Listo para Prod" },
    ] as const;

    columns.forEach(({ id, title }) => {
      it(`renders correctly for column id '${id}'`, () => {
        render(<KanbanColumn id={id} title={title} stories={[]} count={0} />);
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText("0")).toBeInTheDocument();
      });
    });
  });
});
