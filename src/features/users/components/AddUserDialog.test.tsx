import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddUserDialog } from "./AddUserDialog";

const mockToast = vi.fn();
const mockCreateUser = vi.fn();
const mockUpdateUser = vi.fn();
const mockDeleteUser = vi.fn();

vi.mock("@/shared/hooks/use-toast", () => ({
  toast: (...args: unknown[]) => mockToast(...args),
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/features/users/hooks/use-users", () => ({
  useUsers: () => ({
    data: [
      { id: "u1", name: "Alice", created_at: "2024-01-01" },
      { id: "u2", name: "Bob", created_at: "2024-01-02" },
      { id: "u3", name: "Charlie", created_at: "2024-01-03" },
    ],
    isLoading: false,
  }),
  useCreateUser: () => ({ mutate: mockCreateUser, isPending: false }),
  useUpdateUser: () => ({ mutate: mockUpdateUser, isPending: false }),
  useDeleteUser: () => ({ mutate: mockDeleteUser }),
}));

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: /usuarios/i }));
};

describe("AddUserDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the trigger button with 'Usuarios' label", () => {
      render(<AddUserDialog />);
      expect(screen.getByRole("button", { name: /usuarios/i })).toBeInTheDocument();
    });

    it("opens the dialog with the correct title when trigger is clicked", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      expect(screen.getByText("Gestión de Usuarios")).toBeInTheDocument();
    });

    it("renders the new user name input inside the dialog", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      expect(
        screen.getByPlaceholderText("Nombre del usuario"),
      ).toBeInTheDocument();
    });

    it("renders the 'Agregar Usuario nuevo' section label", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      expect(screen.getByText("Agregar Usuario nuevo")).toBeInTheDocument();
    });

    it("renders the loaded user list", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });
  });

  describe("create behavior", () => {
    it("the create button is disabled when name input is empty", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      const nameInput = screen.getByPlaceholderText("Nombre del usuario");
      expect((nameInput as HTMLInputElement).value).toBe("");
      // The create button (Plus icon) should be disabled when input is empty
      const allButtons = screen.getAllByRole("button");
      const createButton = allButtons.find(
        (b) => b.getAttribute("disabled") !== null && !b.textContent?.trim(),
      );
      expect(createButton).toBeDefined();
    });

    it("shows a duplicate name error toast when creating an existing user", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      const nameInput = screen.getByPlaceholderText("Nombre del usuario");
      await user.type(nameInput, "Alice");
      const allButtons = screen.getAllByRole("button");
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

    it("calls createUser with the trimmed name when a valid name is submitted", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      const nameInput = screen.getByPlaceholderText("Nombre del usuario");
      await user.type(nameInput, "New User");
      const allButtons = screen.getAllByRole("button");
      const createButton = allButtons.find(
        (b) => !b.textContent?.trim() && b.getAttribute("disabled") === null,
      );
      if (createButton) await user.click(createButton);
      expect(mockCreateUser).toHaveBeenCalledWith(
        { name: "New User" },
        expect.any(Object),
      );
    });

    it("submits when Enter is pressed in the name input", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      const nameInput = screen.getByPlaceholderText("Nombre del usuario");
      await user.type(nameInput, "New User{Enter}");
      expect(mockCreateUser).toHaveBeenCalledWith(
        { name: "New User" },
        expect.any(Object),
      );
    });
  });

  describe("filter behavior", () => {
    it("renders the filter input when users are present", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      expect(screen.getByPlaceholderText("Buscar por nombre...")).toBeInTheDocument();
    });

    it("filters the user list when typing in the filter input", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      const filterInput = screen.getByPlaceholderText("Buscar por nombre...");
      await user.type(filterInput, "Ali");
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.queryByText("Bob")).not.toBeInTheDocument();
      expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
    });

    it("shows 'No hay resultados.' when filter matches nothing", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      const filterInput = screen.getByPlaceholderText("Buscar por nombre...");
      await user.type(filterInput, "xyz_no_match");
      expect(screen.getByText("No hay resultados.")).toBeInTheDocument();
    });
  });

  describe("edit behavior", () => {
    it("shows an edit input with the user name when the pencil button is clicked", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      // Icon buttons order: [create(+), alice_pencil, alice_trash, bob_pencil, bob_trash, ...]
      const allIconButtons = screen
        .getAllByRole("button")
        .filter((b) => !b.textContent?.trim());
      // Index 1 = Alice's pencil button
      await user.click(allIconButtons[1]);
      // An edit input should appear with the user name pre-filled
      const editInputs = screen.getAllByRole("textbox");
      const editInput = editInputs.find(
        (i) => (i as HTMLInputElement).value === "Alice",
      );
      expect(editInput).toBeInTheDocument();
    });
  });

  describe("delete behavior", () => {
    it("calls deleteUser when a trash button is clicked", async () => {
      const user = userEvent.setup();
      render(<AddUserDialog />);
      await openDialog(user);
      const allIconButtons = screen
        .getAllByRole("button")
        .filter((b) => !b.textContent?.trim());
      // Icon buttons: [create, pencil_alice, trash_alice, pencil_bob, trash_bob, ...]
      // Trash button for first user is at index 2
      if (allIconButtons[2]) await user.click(allIconButtons[2]);
      expect(mockDeleteUser).toHaveBeenCalledWith("u1", expect.any(Object));
    });
  });
});
