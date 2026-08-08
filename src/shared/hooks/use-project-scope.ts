import { useQuery } from "@tanstack/react-query";
import {
	createContext,
	createElement,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { supabase } from "@/infrastructure/supabaseClient";
import { PROJECT_IDS, type ProjectId } from "@/shared/constants/projects";
import {
	getProjectScope,
	type ProjectScope,
} from "@/shared/utils/projectScope";

const PROJECT_SCOPE_QUERY_KEY = ["project-scope"] as const;

type ProfileRow = {
	readonly role: string;
	readonly project_id: string | null;
};

type ProjectScopeContextValue = ProjectScope & {
	readonly selectedProjectId: ProjectId;
	readonly setSelectedProjectId: (projectId: string) => void;
	readonly isLoading: boolean;
	readonly hasProfile: boolean;
};

export type ProjectScopeProviderProps = {
	readonly children: ReactNode;
	readonly profile?: ProfileRow;
};

const ProjectScopeContext = createContext<ProjectScopeContextValue | null>(
	null,
);

export function ProjectScopeProvider({
	children,
	profile: providedProfile,
}: ProjectScopeProviderProps): JSX.Element {
	const [selectedProjectId, setSelectedProjectId] = useState<ProjectId>(
		PROJECT_IDS.ONBOARDING,
	);
	const { data: fetchedProfile, isLoading } = useQuery({
		queryKey: PROJECT_SCOPE_QUERY_KEY,
		enabled: providedProfile === undefined,
		queryFn: async (): Promise<ProfileRow | null> => {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();
			if (userError) throw new Error(userError.message);
			if (!user) return null;

			const { data: profile, error: profileError } = await supabase
				.from("profiles")
				.select("role, project_id")
				.eq("id", user.id)
				.single<ProfileRow>();
			if (profileError) throw new Error(profileError.message);
			return profile;
		},
	});

	const profile = providedProfile ?? fetchedProfile;
	const baseScope = profile ? getProjectScope(profile) : null;
	const value = useMemo<ProjectScopeContextValue>(() => {
		const isAdmin = baseScope?.isAdmin ?? false;
		const projectId = isAdmin
			? selectedProjectId
			: (baseScope?.projectId ?? null);

		return {
			projectId,
			isAdmin,
			selectedProjectId,
			setSelectedProjectId: (nextProjectId: string): void => {
				if (!isAdmin) return;
				if (Object.values(PROJECT_IDS).includes(nextProjectId as ProjectId)) {
					setSelectedProjectId(nextProjectId as ProjectId);
				}
			},
			isLoading: providedProfile === undefined ? isLoading : false,
			hasProfile: profile !== null && profile !== undefined,
		};
	}, [baseScope, isLoading, profile, providedProfile, selectedProjectId]);

	return createElement(ProjectScopeContext.Provider, { value }, children);
}

export type UseProjectScopeReturn = ProjectScopeContextValue;

export function useProjectScope(): UseProjectScopeReturn {
	const scope = useContext(ProjectScopeContext);
	if (!scope) {
		throw new Error("useProjectScope must be used within ProjectScopeProvider");
	}
	return scope;
}
