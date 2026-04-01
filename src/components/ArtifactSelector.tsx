import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useArtifacts } from "@/hooks/use-stories";
import { Artifact } from "@/types";
import { X } from "lucide-react";
import { useState } from "react";

interface ArtifactSelectorProps {
  selected: Artifact[];
  onChange: (artifacts: Artifact[]) => void;
  error?: string;
}

export function ArtifactSelector({ selected, onChange, error }: ArtifactSelectorProps) {
  const [search, setSearch] = useState("");
  const { data: allArtifacts = [] } = useArtifacts();

  const filtered = allArtifacts.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) &&
      !selected.some((s) => s.id === a.id)
  );

  const add = (artifact: Artifact) => {
    onChange([...selected, artifact]);
    setSearch("");
  };

  const remove = (id: string) => {
    onChange(selected.filter((a) => a.id !== id));
  };

  return (
    <div className="grid gap-2">
      <Label>Artefactos</Label>
      <Input
        placeholder="Buscar artefacto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search && filtered.length > 0 && (
        <div className="border rounded-md max-h-[140px] overflow-y-auto">
          {filtered.map((a) => (
            <button
              key={a.id}
              type="button"
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-white flex items-center justify-between"
              onClick={() => add(a)}
            >
              <span>{a.name}</span>
              <span className="text-xs opacity-70">{a.type}</span>
            </button>
          ))}
        </div>
      )}
      {search && filtered.length === 0 && (
        <p className="text-xs text-muted-foreground">Sin resultados.</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {selected.map((a) => (
            <Badge key={a.id} variant="secondary" className="text-xs">
              {a.name}
              <button
                type="button"
                onClick={() => remove(a.id!)}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
