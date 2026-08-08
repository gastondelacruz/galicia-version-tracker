import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useArtifactSelector } from "@/features/artifacts/hooks/use-artifact-selector";
import { Artifact } from "@/shared/types";
import { X } from "lucide-react";

type ArtifactSelectorProps = {
	readonly selected: Artifact[];
	readonly onChange: (artifacts: Artifact[]) => void;
	readonly error?: string;
};

export function ArtifactSelector({
	selected,
	onChange,
	error,
}: ArtifactSelectorProps): JSX.Element {
	const {
		search,
		setSearch,
		filtered,
		isOpen,
		handleOpen,
		handleClose,
		handleAdd,
		handleRemove,
	} = useArtifactSelector({ selected, onChange });

	return (
		<div className="grid gap-2">
			<Label>Artefactos</Label>
			<div className="relative">
				<Input
					placeholder="Buscar artefacto..."
					value={search}
					onFocus={handleOpen}
					onBlur={handleClose}
					onChange={(e) => setSearch(e.target.value)}
				/>
				{isOpen && (
					<div className="absolute z-10 mt-1 w-full border rounded-md bg-background max-h-[180px] overflow-y-auto shadow-md">
						{filtered.length > 0 ? (
							filtered.map((a) => (
								<button
									key={a.id}
									type="button"
									className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-white flex items-center justify-between"
									onMouseDown={(event) => event.preventDefault()}
									onClick={() => handleAdd(a)}
								>
									<span>{a.name}</span>
									<span className="text-xs opacity-70">{a.type}</span>
								</button>
							))
						) : (
							<p className="px-3 py-2 text-xs text-muted-foreground">
								Sin resultados.
							</p>
						)}
					</div>
				)}
			</div>
			{error && <p className="text-sm text-red-500">{error}</p>}
			{selected.length > 0 && (
				<div className="flex flex-wrap gap-2 mt-1">
					{selected.map((a) => (
						<Badge key={a.id} variant="secondary" className="text-xs">
							{a.name}
							<button
								type="button"
								onClick={() => handleRemove(a.id!)}
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
