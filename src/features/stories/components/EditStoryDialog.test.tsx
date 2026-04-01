import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditStoryDialog } from "./EditStoryDialog";
import { Story } from "@/shared/types";

const mockUpdateStory = vi.fn();
const mockDeleteStory = vi.fn();
const mockAddArtifact = vi.fn();
const mockRemoveArtifact = vi.fn();
const mockToast = vi.fn();

vi.mock("@/shared/hooks/use-toast", () => ({
  toast: (...args: unknown[]) => mockToast(...args),
  useToast: () => ({ toast: mockToast }),
}));

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
    data: [{ id: "a1", name: "API Gateway", type: "BACK" }],
    isLoading: false,
  }),
  useAddStoryArtifact: () => ({ mutate: mockAddArtifact }),
  useRemoveStoryArtifact: () => ({ mutate: mockRemoveArtifact }),
}));

vi.mock("@/features/stories/hooks/use-stories", () => ({
  useUpdateStory: () => ({ mutate: mockUpdateStory, isPending: false }),
  useDeleteStory: () => ({ mutate: mockDeleteStory, isPending: false }),
}));

vi.mock("@/features/artifacts/components/ArtifactSelector", () => ({
  ArtifactSelector: ({
    error,
  }: {
    selected: unknown[];
    onChange: (v: unknown[]) => void;
    error?: string;
  }) => (
    <div>
      <div data-testid="artifact-selector">Artifact Selector</div>
      {error && <p>{error}</p>}
    </div>
  ),
}));

const mockStory: Story = {
  id: "s1",
  name: "Implementar autenticación OAuth",
  assigned_to: "u1",
  environment: "dev",
  type: "FRONT",
  created_at: "2024-01-01",
};

const renderComponent = (open = true, onOpenChange = vi.fn()) => {
  return {
    user: userEvent.setup(),
    onOpenChange,
    ...render(
      <EditStoryDialog story={mockStory} open={open} onOpenChange={onOpenChange} />,
    ),
  };
};

describe("EditStoryDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the dialog title 'Editar Historia' when open", () => {
      renderComponent();
      expect(screen.getByText("Editar Historia")).toBeInTheDocument();
    });

    it("renders the story name pre-filled in the name input", () => {
      renderComponent();
      const nameInput = screen.getByLabelText("Nombre de la historia");
      expect(nameInput).toHaveValue("Implementar autenticación OAuth");
    });

    it("renders the ArtifactSelector", () => {
      renderComponent();
      expect(screen.getByTestId("artifact-selector")).toBeInTheDocument();
    });

    it("renders 'Guardar Cambios', 'Cancelar' and 'Eliminar' buttons", () => {
      renderComponent();
      expect(
        screen.getByRole("button", { name: /guardar cambios/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancelar/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /eliminar/i }),
      ).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
      renderComponent(false);
      expect(screen.queryByText("Editar Historia")).not.toBeInTheDocument();
    });
  });

  describe("delete confirmation", () => {
    it("shows the delete confirmation alert when 'Eliminar' is clicked", async () => {
      const { user } = renderComponent();
      await user.click(screen.getByRole("button", { name: /eliminar/i }));
      await waitFor(() => {
        expect(screen.getByText("¿Estás seguro?")).toBeInTheDocument();
      });
    });

    it("shows the story name in the confirmation alert description", async () => {
      const { user } = renderComponent();
      await user.click(screen.getByRole("button", { name: /eliminar/i }));
      await waitFor(() => {
        expect(
          screen.getByText(/implementar autenticación oauth/i),
        ).toBeInTheDocument();
      });
    });

    it("calls deleteStory when the confirmation 'Eliminar' button is clicked", async () => {
      const { user } = renderComponent();
      await user.click(screen.getByRole("button", { name: /eliminar/i }));
      await waitFor(() => {
        expect(screen.getByText("¿Estás seguro?")).toBeInTheDocument();
      });
      const confirmButtons = screen.getAllByRole("button", { name: /eliminar/i });
      // The last 'Eliminar' button is inside the AlertDialog
      await user.click(confirmButtons[confirmButtons.length - 1]);
      expect(mockDeleteStory).toHaveBeenCalledWith(
        { storyId: "s1" },
        expect.any(Object),
      );
    });

    it("hides the confirmation alert when 'Cancelar' in the alert is clicked", async () => {
      const { user } = renderComponent();
      await user.click(screen.getByRole("button", { name: /eliminar/i }));
      await waitFor(() => {
        expect(screen.getByText("¿Estás seguro?")).toBeInTheDocument();
      });
      // The AlertDialogCancel has label "Cancelar"
      const cancelButtons = screen.getAllByRole("button", { name: /cancelar/i });
      await user.click(cancelButtons[cancelButtons.length - 1]);
      await waitFor(() => {
        expect(screen.queryByText("¿Estás seguro?")).not.toBeInTheDocument();
      });
    });
  });

  describe("cancel behavior", () => {
    it("calls onOpenChange(false) when 'Cancelar' is clicked", async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(
        <EditStoryDialog story={mockStory} open={true} onOpenChange={onOpenChange} />,
      );
      await user.click(screen.getByRole("button", { name: /cancelar/i }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("save behavior", () => {
    it("calls updateStory with updated name when 'Guardar Cambios' is submitted", async () => {
      const { user } = renderComponent();
      const nameInput = screen.getByLabelText("Nombre de la historia");
      await user.clear(nameInput);
      await user.type(nameInput, "Nueva Historia Editada");
      await user.click(screen.getByRole("button", { name: /guardar cambios/i }));
      await waitFor(() => {
        expect(mockUpdateStory).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "s1",
            updates: expect.objectContaining({ name: "Nueva Historia Editada" }),
          }),
          expect.any(Object),
        );
      });
    });
  });
});
