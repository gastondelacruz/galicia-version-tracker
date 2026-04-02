import { useArtifacts } from "@/features/artifacts/hooks/use-artifacts";
import { Artifact } from "@/shared/types";
import { useState } from "react";

type UseArtifactSelectorParams = {
  readonly selected: Artifact[];
  readonly onChange: (artifacts: Artifact[]) => void;
};

type UseArtifactSelectorReturn = {
  readonly search: string;
  readonly setSearch: (v: string) => void;
  readonly filtered: Artifact[];
  readonly handleAdd: (artifact: Artifact) => void;
  readonly handleRemove: (id: string) => void;
};

export function useArtifactSelector({
  selected,
  onChange,
}: UseArtifactSelectorParams): UseArtifactSelectorReturn {
  const [search, setSearch] = useState("");
  const { data: allArtifacts = [] } = useArtifacts();

  const filtered = allArtifacts.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) &&
      !selected.some((s) => s.id === a.id),
  );

  const handleAdd = (artifact: Artifact): void => {
    onChange([...selected, artifact]);
    setSearch("");
  };

  const handleRemove = (id: string): void => {
    onChange(selected.filter((a) => a.id !== id));
  };

  return { search, setSearch, filtered, handleAdd, handleRemove };
}
