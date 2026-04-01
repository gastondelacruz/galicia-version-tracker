import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddStoryDialog } from "./AddStoryDialog";

const mockCreateStory = vi.fn();
const mockAddStoryArtifact = vi.fn();

vi.mock("@/features/stories/hooks/use-stories", () => ({
  useCreateStory: () => ({ mutate: mockCreateStory, isPending: false }),
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
  useArtifacts: () => ({ data: [], isLoading: false }),
  useAddStoryArtifact: () => ({ mutate: mockAddStoryArtifact }),
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

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: /nueva historia/i }));
};

describe("AddStoryDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the trigger button with 'Nueva Historia' label", () => {
      render(<AddStoryDialog />);
      expect(
        screen.getByRole("button", { name: /nueva historia/i }),
      ).toBeInTheDocument();
    });

    it("opens the dialog with the correct title when trigger is clicked", async () => {
      const user = userEvent.setup();
      render(<AddStoryDialog />);
      await openDialog(user);
      expect(screen.getByText("Crear Nueva Historia")).toBeInTheDocument();
    });

    it("renders the dialog description", async () => {
      const user = userEvent.setup();
      render(<AddStoryDialog />);
      await openDialog(user);
      expect(
        screen.getByText(/completa los detalles de la historia/i),
      ).toBeInTheDocument();
    });

    it("renders the story name input", async () => {
      const user = userEvent.setup();
      render(<AddStoryDialog />);
      await openDialog(user);
      expect(screen.getByLabelText("Nombre de la historia")).toBeInTheDocument();
    });

    it("renders the environment select label", async () => {
      const user = userEvent.setup();
      render(<AddStoryDialog />);
      await openDialog(user);
      expect(screen.getByText("Ambiente")).toBeInTheDocument();
    });

    it("renders the type select label", async () => {
      const user = userEvent.setup();
      render(<AddStoryDialog />);
      await openDialog(user);
      expect(screen.getByText("Tipo")).toBeInTheDocument();
    });

    it("renders the ArtifactSelector", async () => {
      const user = userEvent.setup();
      render(<AddStoryDialog />);
      await openDialog(user);
      expect(screen.getByTestId("artifact-selector")).toBeInTheDocument();
    });

    it("renders the 'Cancelar' and 'Crear Historia' buttons", async () => {
      const user = userEvent.setup();
      render(<AddStoryDialog />);
      await openDialog(user);
      expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /crear historia/i })).toBeInTheDocument();
    });
  });

  describe("form validation", () => {
    it("shows 'El nombre es requerido' when submitted with empty name", async () => {
      const user = userEvent.setup();
      render(<AddStoryDialog />);
      await openDialog(user);
      await user.click(screen.getByRole("button", { name: /crear historia/i }));
      await waitFor(() => {
        expect(screen.getByText("El nombre es requerido")).toBeInTheDocument();
      });
    });

    it("shows 'La persona asignada es requerida' when submitted without assignee", async () => {
      const user = userEvent.setup();
      render(<AddStoryDialog />);
      await openDialog(user);
      await user.click(screen.getByRole("button", { name: /crear historia/i }));
      await waitFor(() => {
        expect(
          screen.getByText("La persona asignada es requerida"),
        ).toBeInTheDocument();
      });
    });

    it("shows 'Debe seleccionar al menos un artefacto' when submitted without artifacts", async () => {
      const user = userEvent.setup();
      render(<AddStoryDialog />);
      await openDialog(user);
      await user.click(screen.getByRole("button", { name: /crear historia/i }));
      await waitFor(() => {
        expect(
          screen.getByText("Debe seleccionar al menos un artefacto"),
        ).toBeInTheDocument();
      });
    });

    it("does not call createStory when the form is invalid", async () => {
      const user = userEvent.setup();
      render(<AddStoryDialog />);
      await openDialog(user);
      await user.click(screen.getByRole("button", { name: /crear historia/i }));
      await waitFor(() => {
        expect(screen.getByText("El nombre es requerido")).toBeInTheDocument();
      });
      expect(mockCreateStory).not.toHaveBeenCalled();
    });
  });

  describe("cancel behavior", () => {
    it("closes the dialog when 'Cancelar' is clicked", async () => {
      const user = userEvent.setup();
      render(<AddStoryDialog />);
      await openDialog(user);
      expect(screen.getByText("Crear Nueva Historia")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /cancelar/i }));
      await waitFor(() => {
        expect(screen.queryByText("Crear Nueva Historia")).not.toBeInTheDocument();
      });
    });
  });
});
