import { useProjectScope } from "@/shared/hooks/use-project-scope";
import type { ProjectId } from "@/shared/constants/projects";

type UseProjectSelectorReturn = {
	readonly isAdmin: boolean;
	readonly selectedProjectId: ProjectId;
	readonly setSelectedProjectId: (projectId: string) => void;
};

export function useProjectSelector(): UseProjectSelectorReturn {
	const { isAdmin, selectedProjectId, setSelectedProjectId } =
		useProjectScope();
	return { isAdmin, selectedProjectId, setSelectedProjectId };
}
