import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddArtifactDialog } from "./AddArtifactDialog";

const mockToast = vi.fn();
const mockCreateArtifact = vi.fn();
const mockUpdateArtifact = vi.fn();
const mockDeleteArtifact = vi.fn();

vi.mock("@/shared/hooks/use-toast", () => ({
  toast: (...args: unknown[]) => mockToast(...args),
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/features/artifacts/hooks/use-artifacts", () => ({
  useArtifacts: () => ({
    data: [
      { id: "1", name: "API Gateway", type: "BACK" },
      { id: "2", name: "Auth Service", type: "BACK" },
      { id: "3", name: "Dashboard UI", type: "FRONT" },
    ],
    isLoading: false,
  }),
  useCreateArtifact: () => ({
    mutate: mockCreateArtifact,
    isPending: false,
  }),
  useUpdateArtifact: () => ({
    mutate: mockUpdateArtifact,
    isPending: false,
  }),
  useDeleteArtifact: () => ({
    mutate: mockDeleteArtifact,
  }),
}));

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: /artefactos/i }));
};

describe("AddArtifactDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the trigger button with 'Artefactos' label", () => {
      render(<AddArtifactDialog />);
      expect(screen.getByRole("button", { name: /artefactos/i })).toBeInTheDocument();
    });

    it("opens the dialog with the correct title when trigger is clicked", async () => {
      const user = userEvent.setup();
      render(<AddArtifactDialog />);
      await openDialog(user);
      expect(screen.getByText("Gestión de Artefactos")).toBeInTheDocument();
    });

    it("renders the new artifact name input inside the dialog", async () => {
      const user = userEvent.setup();
      render(<AddArtifactDialog />);
      await openDialog(user);
      expect(
        screen.getByPlaceholderText("Nombre del artefacto"),
      ).toBeInTheDocument();
    });

    it("renders the 'Agregar Artefacto nuevo' section label", async () => {
      const user = userEvent.setup();
      render(<AddArtifactDialog />);
      await openDialog(user);
      expect(screen.getByText("Agregar Artefacto nuevo")).toBeInTheDocument();
    });

    it("renders the loaded artifacts list", async () => {
      const user = userEvent.setup();
      render(<AddArtifactDialog />);
      await openDialog(user);
      expect(screen.getByText("API Gateway")).toBeInTheDocument();
      expect(screen.getByText("Auth Service")).toBeInTheDocument();
      expect(screen.getByText("Dashboard UI")).toBeInTheDocument();
    });
  });

  describe("create behavior", () => {
    it("the create button is disabled when name input is empty", async () => {
      const user = userEvent.setup();
      render(<AddArtifactDialog />);
      await openDialog(user);
      // The Plus button is disabled when name is empty
      const buttons = screen.getAllByRole("button");
      // The create button is the one with the Plus icon (small icon-only button)
      const createButton = buttons.find(
        (b) => b.getAttribute("disabled") !== null && !b.textContent?.trim(),
      );
      expect(createButton).toBeDefined();
    });

    it("shows a duplicate name error toast when creating an existing artifact", async () => {
      const user = userEvent.setup();
      render(<AddArtifactDialog />);
      await openDialog(user);
      const nameInput = screen.getByPlaceholderText("Nombre del artefacto");
      await user.type(nameInput, "API Gateway");
      // Find the create button by looking for the disabled-when-empty button that is now enabled
      const allButtons = screen.getAllByRole("button");
      // The create (Plus icon) button is the 3rd button in the new artifact row (name input, select, button)
      const createButton = allButtons.find(
        (b) => !b.textContent?.trim() && b.getAttribute("disabled") === null,
      );
      if (createButton) await user.click(createButton);
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Error",
            variant: "destructive",
          }),
        );
      });
    });

    it("calls createArtifact with trimmed name when a valid name is submitted", async () => {
      const user = userEvent.setup();
      render(<AddArtifactDialog />);
      await openDialog(user);
      const nameInput = screen.getByPlaceholderText("Nombre del artefacto");
      await user.type(nameInput, "New Unique Artifact");
      const allButtons = screen.getAllByRole("button");
      const createButton = allButtons.find(
        (b) => !b.textContent?.trim() && b.getAttribute("disabled") === null,
      );
      if (createButton) await user.click(createButton);
      expect(mockCreateArtifact).toHaveBeenCalledWith(
        expect.objectContaining({ name: "New Unique Artifact", type: "BACK" }),
        expect.any(Object),
      );
    });
  });

  describe("filter behavior", () => {
    it("renders the filter input when artifacts are present", async () => {
      const user = userEvent.setup();
      render(<AddArtifactDialog />);
      await openDialog(user);
      expect(screen.getByPlaceholderText("Buscar por nombre...")).toBeInTheDocument();
    });

    it("filters the artifact list when typing in the filter input", async () => {
      const user = userEvent.setup();
      render(<AddArtifactDialog />);
      await openDialog(user);
      const filterInput = screen.getByPlaceholderText("Buscar por nombre...");
      await user.type(filterInput, "API");
      expect(screen.getByText("API Gateway")).toBeInTheDocument();
      expect(screen.queryByText("Auth Service")).not.toBeInTheDocument();
    });

    it("shows 'No hay resultados.' when filter matches nothing", async () => {
      const user = userEvent.setup();
      render(<AddArtifactDialog />);
      await openDialog(user);
      const filterInput = screen.getByPlaceholderText("Buscar por nombre...");
      await user.type(filterInput, "xyz_no_match");
      expect(screen.getByText("No hay resultados.")).toBeInTheDocument();
    });
  });

  describe("edit behavior", () => {
    it("shows an edit input when the pencil button of an artifact is clicked", async () => {
      const user = userEvent.setup();
      render(<AddArtifactDialog />);
      await openDialog(user);
      // Icon buttons order: [create(+), api_pencil, api_trash, auth_pencil, auth_trash, ...]
      const allIconButtons = screen
        .getAllByRole("button")
        .filter((b) => !b.textContent?.trim());
      // Index 1 = API Gateway's pencil button
      await user.click(allIconButtons[1]);
      // An edit input should appear with the artifact name pre-filled
      const editInputs = screen.getAllByRole("textbox");
      const editInput = editInputs.find(
        (i) => (i as HTMLInputElement).value === "API Gateway",
      );
      expect(editInput).toBeInTheDocument();
    });
  });

  describe("delete behavior", () => {
    it("calls deleteArtifact when the trash button is clicked", async () => {
      const user = userEvent.setup();
      render(<AddArtifactDialog />);
      await openDialog(user);
      // Icon buttons order: [create(+), api_pencil, api_trash, auth_pencil, auth_trash, ...]
      const allIconButtons = screen
        .getAllByRole("button")
        .filter((b) => !b.textContent?.trim());
      // Index 2 = API Gateway's trash button
      await user.click(allIconButtons[2]);
      expect(mockDeleteArtifact).toHaveBeenCalledWith("1", expect.any(Object));
    });
  });
});
