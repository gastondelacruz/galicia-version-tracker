import type { Artifact } from "@/shared/types";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { DB_TABLES } from "@/shared/constants/tables";
import { useProjectScope } from "@/shared/hooks/use-project-scope";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/supabaseClient";

export const useArtifacts = () => {
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useQuery({
		queryKey: QUERY_KEYS.ARTIFACTS(scopeKey),
		enabled: !scope.isLoading && scope.hasProfile,
		queryFn: async (): Promise<Artifact[]> => {
			let query = supabase
				.from(DB_TABLES.ARTIFACTS)
				.select("*")
				.order("name", { ascending: true });
			if (scope.projectId) query = query.eq("project_id", scope.projectId);
			const { data, error } = await query;
			if (error) throw new Error(error.message);
			return data as Artifact[];
		},
	});
};

export const useCreateArtifact = () => {
	const queryClient = useQueryClient();
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useMutation({
		mutationFn: async ({ name, type }: Pick<Artifact, "name" | "type">) => {
			const projectId = scope.projectId;
			if (!projectId)
				throw new Error(
					"A project must be selected before creating an artifact",
				);
			const { data, error } = await supabase
				.from(DB_TABLES.ARTIFACTS)
				.insert({
					name,
					type,
					project_id: projectId,
				})
				.select()
				.single();
			if (error) throw new Error(error.message);
			return data as Artifact;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.ARTIFACTS(scopeKey),
			}),
	});
};

export const useUpdateArtifact = () => {
	const queryClient = useQueryClient();
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useMutation({
		mutationFn: async ({
			id,
			name,
			type,
		}: {
			id: string;
			name: string;
			type: Artifact["type"];
		}) => {
			const { data, error } = await supabase
				.from(DB_TABLES.ARTIFACTS)
				.update({ name, type })
				.eq("id", id)
				.select()
				.single();
			if (error) throw new Error(error.message);
			return data as Artifact;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.ARTIFACTS(scopeKey),
			}),
	});
};

export const useDeleteArtifact = () => {
	const queryClient = useQueryClient();
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase
				.from(DB_TABLES.ARTIFACTS)
				.delete()
				.eq("id", id);
			if (error) throw new Error(error.message);
		},
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.ARTIFACTS(scopeKey),
			}),
	});
};

export const useStoryArtifacts = (storyId: string) => {
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useQuery({
		queryKey: QUERY_KEYS.storyArtifacts(storyId, scopeKey),
		enabled: !!storyId && !scope.isLoading && scope.hasProfile,
		queryFn: async (): Promise<Artifact[]> => {
			let query = supabase
				.from(DB_TABLES.STORY_ARTIFACTS)
				.select(
					`${DB_TABLES.ARTIFACTS}!story_artifacts_artifact_project_fkey(*)`,
				)
				.eq("story_id", storyId);
			if (scope.projectId) query = query.eq("project_id", scope.projectId);
			const { data, error } = await query;
			if (error) throw new Error(error.message);
			return (data
				?.flatMap((row: { artifactsv2: Artifact[] }) => row.artifactsv2)
				.filter(Boolean) ?? []) as Artifact[];
		},
	});
};

export const useAddStoryArtifact = () => {
	const queryClient = useQueryClient();
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useMutation({
		mutationFn: async ({
			storyId,
			artifactId,
		}: {
			storyId: string;
			artifactId: string;
		}) => {
			const projectId = scope.projectId;
			if (!projectId)
				throw new Error(
					"A project must be selected before adding an artifact to a story",
				);
			const { error } = await supabase.from(DB_TABLES.STORY_ARTIFACTS).insert({
				story_id: storyId,
				artifact_id: artifactId,
				project_id: projectId,
			});
			if (error) throw new Error(error.message);
		},
		onSuccess: (_, { storyId }) => {
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.storyArtifacts(storyId, scopeKey),
			});
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORIES(scopeKey) });
		},
	});
};

export const useRemoveStoryArtifact = () => {
	const queryClient = useQueryClient();
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useMutation({
		mutationFn: async ({
			storyId,
			artifactId,
		}: {
			storyId: string;
			artifactId: string;
		}) => {
			const { error } = await supabase
				.from(DB_TABLES.STORY_ARTIFACTS)
				.delete()
				.eq("story_id", storyId)
				.eq("artifact_id", artifactId);
			if (error) throw new Error(error.message);
		},
		onSuccess: (_, { storyId }) => {
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.storyArtifacts(storyId, scopeKey),
			});
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORIES(scopeKey) });
		},
	});
};
