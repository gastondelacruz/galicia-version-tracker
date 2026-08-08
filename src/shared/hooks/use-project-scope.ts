import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/supabaseClient";
import {
	getProjectScope,
	type ProjectScope,
} from "@/shared/utils/projectScope";

const PROJECT_SCOPE_QUERY_KEY = ["project-scope"] as const;

type ProfileRow = {
	readonly role: string;
	readonly project_id: string | null;
};

type UseProjectScopeReturn = ProjectScope & {
	readonly isLoading: boolean;
	readonly hasProfile: boolean;
};

export function useProjectScope(): UseProjectScopeReturn {
	const { data, isLoading } = useQuery({
		queryKey: PROJECT_SCOPE_QUERY_KEY,
		queryFn: async (): Promise<ProjectScope | null> => {
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

			return getProjectScope(profile);
		},
	});

	return {
		projectId: data?.projectId ?? null,
		isAdmin: data?.isAdmin ?? false,
		isLoading,
		hasProfile: data !== null && data !== undefined,
	};
}
