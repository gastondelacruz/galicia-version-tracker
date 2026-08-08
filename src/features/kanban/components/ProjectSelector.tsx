import { useProjectSelector } from "@/features/kanban/hooks/use-project-selector";
import { PROJECT_IDS } from "@/shared/constants/projects";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";

export function ProjectSelector(): JSX.Element | null {
	const { isAdmin, selectedProjectId, setSelectedProjectId } =
		useProjectSelector();

	if (!isAdmin) return null;

	return (
		<Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
			<SelectTrigger aria-label="Proyecto">
				<SelectValue placeholder="Seleccionar proyecto" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={PROJECT_IDS.ONBOARDING}>Onboarding</SelectItem>
				<SelectItem value={PROJECT_IDS.PLATAFORMA}>Plataforma</SelectItem>
			</SelectContent>
		</Select>
	);
}
