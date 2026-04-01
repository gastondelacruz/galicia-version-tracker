import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StoryCard } from "./StoryCard";
import { Story } from "@/shared/types";

vi.mock("@dnd-kit/core", async () => {
  const actual = await vi.importActual<typeof import("@dnd-kit/core")>("@dnd-kit/core");
  return {
    ...actual,
    useDraggable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      isDragging: false,
    }),
  };
});

vi.mock("@/features/users/hooks/use-users", () => ({
  useUsers: () => ({
    data: [
      { id: "u1", name: "Alice", created_at: "2024-01-01" },
      { id: "u2", name: "Bob", created_at: "2024-01-02" },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/features/artifacts/hooks/use-artifacts", () => ({
  useStoryArtifacts: () => ({
    data: [
      { id: "a1", name: "API Gateway", type: "BACK" },
      { id: "a2", name: "Dashboard UI", type: "FRONT" },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/features/stories/components/EditStoryDialog", () => ({
  EditStoryDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="edit-dialog">Edit Dialog</div> : null,
}));

const mockStory: Story = {
  id: "s1",
  name: "Implementar autenticación OAuth",
  assigned_to: "u1",
  environment: "dev",
  type: "FRONT",
  created_at: "2024-01-01",
};

describe("StoryCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the story name", () => {
      render(<StoryCard story={mockStory} />);
      expect(
        screen.getByText("Implementar autenticación OAuth"),
      ).toBeInTheDocument();
    });

    it("renders the story type badge", () => {
      render(<StoryCard story={mockStory} />);
      expect(screen.getByText("FRONT")).toBeInTheDocument();
    });

    it("renders the assigned user name", () => {
      render(<StoryCard story={mockStory} />);
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    it("renders artifact names as badges", () => {
      render(<StoryCard story={mockStory} />);
      expect(screen.getByText("API Gateway")).toBeInTheDocument();
      expect(screen.getByText("Dashboard UI")).toBeInTheDocument();
    });

    it("renders the 'Tipo:' label", () => {
      render(<StoryCard story={mockStory} />);
      expect(screen.getByText("Tipo:")).toBeInTheDocument();
    });

    it("renders the 'Artefactos:' label", () => {
      render(<StoryCard story={mockStory} />);
      expect(screen.getByText("Artefactos:")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("opens the EditStoryDialog when the card is clicked", async () => {
      const user = userEvent.setup();
      render(<StoryCard story={mockStory} />);
      expect(screen.queryByTestId("edit-dialog")).not.toBeInTheDocument();
      await user.click(screen.getByText("Implementar autenticación OAuth"));
      expect(screen.getByTestId("edit-dialog")).toBeInTheDocument();
    });
  });

  describe("BACK type story", () => {
    it("renders 'BACK' badge for a BACK type story", () => {
      const backStory: Story = { ...mockStory, type: "BACK" };
      render(<StoryCard story={backStory} />);
      expect(screen.getByText("BACK")).toBeInTheDocument();
    });
  });
});
