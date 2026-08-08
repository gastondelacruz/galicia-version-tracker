import type { Person } from "@/shared/types";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { DB_TABLES } from "@/shared/constants/tables";
import { useProjectScope } from "@/shared/hooks/use-project-scope";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/supabaseClient";

export const useUsers = () => {
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useQuery({
		queryKey: QUERY_KEYS.USERS(scopeKey),
		enabled: !scope.isLoading && scope.hasProfile,
		queryFn: async (): Promise<Person[]> => {
			let query = supabase
				.from(DB_TABLES.PEOPLE)
				.select("*")
				.order("name", { ascending: true });
			if (scope.projectId) query = query.eq("project_id", scope.projectId);
			const { data, error } = await query;
			if (error) throw new Error(error.message);
			return data as Person[];
		},
	});
};

export const useCreateUser = () => {
	const queryClient = useQueryClient();
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useMutation({
		mutationFn: async ({ name }: { name: string }) => {
			const projectId = scope.projectId;
			if (!projectId)
				throw new Error("A project must be selected before creating a user");
			const { data, error } = await supabase
				.from(DB_TABLES.PEOPLE)
				.insert({
					name,
					project_id: projectId,
				})
				.select()
				.single();
			if (error) throw new Error(error.message);
			return data as Person;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS(scopeKey) }),
	});
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useMutation({
		mutationFn: async ({ id, name }: { id: string; name: string }) => {
			const { data, error } = await supabase
				.from(DB_TABLES.PEOPLE)
				.update({ name })
				.eq("id", id)
				.select()
				.single();
			if (error) throw new Error(error.message);
			return data as Person;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS(scopeKey) }),
	});
};

export const useDeleteUser = () => {
	const queryClient = useQueryClient();
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase
				.from(DB_TABLES.PEOPLE)
				.delete()
				.eq("id", id);
			if (error) throw new Error(error.message);
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS(scopeKey) }),
	});
};
