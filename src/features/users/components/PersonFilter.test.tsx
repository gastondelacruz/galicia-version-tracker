import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PersonFilter } from "./PersonFilter";
import { useKanbanStore } from "@/features/kanban/store/kanbanStore";

vi.mock("@/features/users/hooks/use-users", () => ({
  useUsers: () => ({
    data: [
      { id: "u1", name: "Alice", created_at: "2024-01-01" },
      { id: "u2", name: "Bob", created_at: "2024-01-02" },
      { id: "u3", name: "Charlie", created_at: "2024-01-03" },
    ],
    isLoading: false,
  }),
}));

describe("PersonFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Zustand store to initial state before each test
    useKanbanStore.setState({ filteredUsers: [] });
  });

  describe("rendering", () => {
    it("shows 'Todas las personas' when no filter is active", () => {
      render(<PersonFilter />);
      expect(screen.getByText("Todas las personas")).toBeInTheDocument();
    });

    it("does not show the clear button when no filter is active", () => {
      render(<PersonFilter />);
      expect(
        screen.queryByRole("button", { name: /limpiar filtro/i }),
      ).not.toBeInTheDocument();
    });

    it("shows the clear button when a filter is active", () => {
      useKanbanStore.setState({ filteredUsers: ["u1"] });
      render(<PersonFilter />);
      expect(
        screen.getByRole("button", { name: /limpiar filtro/i }),
      ).toBeInTheDocument();
    });

    it("shows the user name when exactly one user is filtered", () => {
      useKanbanStore.setState({ filteredUsers: ["u1"] });
      render(<PersonFilter />);
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    it("shows 'N personas' when multiple users are filtered", () => {
      useKanbanStore.setState({ filteredUsers: ["u1", "u2"] });
      render(<PersonFilter />);
      expect(screen.getByText("2 personas")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("opens the user popover when the filter button is clicked", async () => {
      const user = userEvent.setup();
      render(<PersonFilter />);
      await user.click(screen.getByRole("button", { name: /todas las personas/i }));
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    it("adds a user to the filter when clicked in the popover", async () => {
      const user = userEvent.setup();
      render(<PersonFilter />);
      await user.click(screen.getByRole("button", { name: /todas las personas/i }));
      await user.click(screen.getByText("Alice"));
      expect(useKanbanStore.getState().filteredUsers).toContain("u1");
    });

    it("removes a user from the filter when a checked user is clicked", async () => {
      useKanbanStore.setState({ filteredUsers: ["u1"] });
      const user = userEvent.setup();
      render(<PersonFilter />);
      // Trigger shows "Alice"; clicking it opens the popover
      await user.click(screen.getByRole("button", { name: /alice/i }));
      // Now there are two "Alice" elements: the trigger span and the popover item span
      const aliceElements = screen.getAllByText("Alice");
      // The last one is the popover item
      await user.click(aliceElements[aliceElements.length - 1]);
      expect(useKanbanStore.getState().filteredUsers).not.toContain("u1");
    });

    it("clears all filters when the clear button is clicked", async () => {
      useKanbanStore.setState({ filteredUsers: ["u1", "u2"] });
      const user = userEvent.setup();
      render(<PersonFilter />);
      await user.click(screen.getByRole("button", { name: /limpiar filtro/i }));
      expect(useKanbanStore.getState().filteredUsers).toHaveLength(0);
    });
  });

  describe("checkbox state", () => {
    it("renders checked checkboxes for filtered users", async () => {
      useKanbanStore.setState({ filteredUsers: ["u1"] });
      const user = userEvent.setup();
      render(<PersonFilter />);
      await user.click(screen.getByRole("button", { name: /alice/i }));
      const checkboxes = screen.getAllByRole("checkbox");
      const aliceCheckbox = checkboxes[0];
      expect(aliceCheckbox).toBeChecked();
    });

    it("renders unchecked checkboxes for non-filtered users", async () => {
      useKanbanStore.setState({ filteredUsers: ["u1"] });
      const user = userEvent.setup();
      render(<PersonFilter />);
      await user.click(screen.getByRole("button", { name: /alice/i }));
      const checkboxes = screen.getAllByRole("checkbox");
      const bobCheckbox = checkboxes[1];
      expect(bobCheckbox).not.toBeChecked();
    });
  });
});
