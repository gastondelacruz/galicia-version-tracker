import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ArtifactSelector } from "./ArtifactSelector";
import { Artifact } from "@/shared/types";

vi.mock("@/features/artifacts/hooks/use-artifacts", () => ({
  useArtifacts: () => ({
    data: [
      { id: "1", name: "API Gateway", type: "BACK" },
      { id: "2", name: "Auth Service", type: "BACK" },
      { id: "3", name: "Dashboard UI", type: "FRONT" },
    ],
    isLoading: false,
  }),
}));

const mockArtifact: Artifact = { id: "1", name: "API Gateway", type: "BACK" };

const renderComponent = (overrides: Partial<Parameters<typeof ArtifactSelector>[0]> = {}) => {
  const onChange = vi.fn();
  const props = {
    selected: [] as Artifact[],
    onChange,
    ...overrides,
  };
  return {
    user: userEvent.setup(),
    onChange: props.onChange as ReturnType<typeof vi.fn>,
    ...render(<ArtifactSelector {...props} />),
  };
};

describe("ArtifactSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the label and search input", () => {
      renderComponent();
      expect(screen.getByText("Artefactos")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Buscar artefacto...")).toBeInTheDocument();
    });

    it("does not show the dropdown when search is empty", () => {
      renderComponent();
      expect(screen.queryByText("API Gateway")).not.toBeInTheDocument();
    });

    it("renders selected artifacts as badges", () => {
      renderComponent({ selected: [mockArtifact] });
      expect(screen.getByText("API Gateway")).toBeInTheDocument();
    });

    it("shows error message when error prop is provided", () => {
      renderComponent({ error: "Debe seleccionar al menos un artefacto" });
      expect(
        screen.getByText("Debe seleccionar al menos un artefacto"),
      ).toBeInTheDocument();
    });

    it("renders multiple selected artifacts as badges", () => {
      const selected: Artifact[] = [
        { id: "1", name: "API Gateway", type: "BACK" },
        { id: "3", name: "Dashboard UI", type: "FRONT" },
      ];
      renderComponent({ selected });
      expect(screen.getByText("API Gateway")).toBeInTheDocument();
      expect(screen.getByText("Dashboard UI")).toBeInTheDocument();
    });
  });

  describe("search behavior", () => {
    it("shows matching artifacts in the dropdown when typing", async () => {
      const { user } = renderComponent();
      await user.type(screen.getByPlaceholderText("Buscar artefacto..."), "API");
      expect(screen.getByText("API Gateway")).toBeInTheDocument();
    });

    it("shows the artifact type alongside the name in the dropdown", async () => {
      const { user } = renderComponent();
      await user.type(screen.getByPlaceholderText("Buscar artefacto..."), "API");
      expect(screen.getByText("BACK")).toBeInTheDocument();
    });

    it("shows 'Sin resultados.' when no artifacts match the search", async () => {
      const { user } = renderComponent();
      await user.type(screen.getByPlaceholderText("Buscar artefacto..."), "xyz_no_match");
      expect(screen.getByText("Sin resultados.")).toBeInTheDocument();
    });

    it("does not show already-selected artifacts in the dropdown", async () => {
      const { user } = renderComponent({ selected: [mockArtifact] });
      await user.type(screen.getByPlaceholderText("Buscar artefacto..."), "API");
      // "API Gateway" is selected so it's excluded from dropdown results;
      // the dropdown shows "Sin resultados." because the only match is already selected
      expect(screen.getByText("Sin resultados.")).toBeInTheDocument();
      // The badge still shows the selected artifact name (one instance only)
      expect(screen.getByText("API Gateway")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onChange with the artifact added when a dropdown item is clicked", async () => {
      const onChange = vi.fn();
      const { user } = renderComponent({ selected: [], onChange });
      await user.type(screen.getByPlaceholderText("Buscar artefacto..."), "API");
      await user.click(screen.getByText("API Gateway"));
      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: "1", name: "API Gateway" })]),
      );
    });

    it("clears the search input after selecting an artifact", async () => {
      const { user } = renderComponent();
      const input = screen.getByPlaceholderText("Buscar artefacto...");
      await user.type(input, "API");
      await user.click(screen.getByText("API Gateway"));
      expect(input).toHaveValue("");
    });

    it("calls onChange removing the artifact when the X button is clicked", async () => {
      const onChange = vi.fn();
      const { user } = renderComponent({ selected: [mockArtifact], onChange });
      // The remove button is the only button rendered when there's a selected artifact
      const removeButton = screen.getByRole("button");
      await user.click(removeButton);
      expect(onChange).toHaveBeenCalledWith([]);
    });
  });
});
