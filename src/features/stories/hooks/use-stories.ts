import type { Story } from "@/shared/types";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { DB_TABLES } from "@/shared/constants/tables";
import { useProjectScope } from "@/shared/hooks/use-project-scope";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/supabaseClient";

export const useStoriesWithDetails = () => {
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useQuery({
		queryKey: QUERY_KEYS.STORIES_WITH_DETAILS(scopeKey),
		enabled: !scope.isLoading && scope.hasProfile,
		queryFn: async (): Promise<Story[]> => {
			let query = supabase
				.from(DB_TABLES.STORIES)
				.select(
					`*, assigned_user:${DB_TABLES.PEOPLE}!assigned_to(id, name, created_at)`,
				)
				.order("created_at", { ascending: false });
			if (scope.projectId) query = query.eq("project_id", scope.projectId);
			const { data, error } = await query;
			if (error) throw new Error(error.message);
			return data as Story[];
		},
	});
};

export const useUpdateStoryBasicInfo = () => {
	const queryClient = useQueryClient();
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useMutation({
		mutationFn: async ({
			id,
			updates,
		}: {
			id: string;
			updates: Partial<Pick<Story, "name" | "assigned_to" | "environment">>;
		}) => {
			const { data, error } = await supabase
				.from(DB_TABLES.STORIES)
				.update(updates)
				.eq("id", id)
				.select()
				.single();
			if (error) throw new Error(error.message);
			return data as Story;
		},
		onMutate: async ({ id, updates }) => {
			const storiesQueryKey = QUERY_KEYS.STORIES_WITH_DETAILS(scopeKey);
			await queryClient.cancelQueries({ queryKey: storiesQueryKey });
			const previousStories =
				queryClient.getQueryData<Story[]>(storiesQueryKey);

			queryClient.setQueryData<Story[]>(storiesQueryKey, (currentStories) =>
				currentStories?.map((story) =>
					story.id === id ? { ...story, ...updates } : story,
				),
			);

			return { previousStories };
		},
		onError: (_error, _variables, context) => {
			if (context?.previousStories !== undefined) {
				queryClient.setQueryData(
					QUERY_KEYS.STORIES_WITH_DETAILS(scopeKey),
					context.previousStories,
				);
			}
		},
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.STORIES_WITH_DETAILS(scopeKey),
			});
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORIES(scopeKey) });
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.story(variables.id, scopeKey),
			});
		},
	});
};

export const useUpdateStory = () => {
	const queryClient = useQueryClient();
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useMutation({
		mutationFn: async ({
			id,
			updates,
		}: {
			id: string;
			updates: Partial<
				Pick<Story, "name" | "assigned_to" | "environment" | "type">
			>;
		}) => {
			const { name, assigned_to, environment, type } = updates;
			const storyUpdates: Partial<
				Pick<Story, "name" | "assigned_to" | "environment" | "type">
			> = {};
			if (name !== undefined) storyUpdates.name = name;
			if (assigned_to !== undefined) storyUpdates.assigned_to = assigned_to;
			if (environment !== undefined) storyUpdates.environment = environment;
			if (type !== undefined) storyUpdates.type = type;
			const { data, error } = await supabase
				.from(DB_TABLES.STORIES)
				.update(storyUpdates)
				.eq("id", id)
				.select()
				.single();
			if (error) throw new Error(error.message);
			return data as Story;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORIES(scopeKey) });
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.STORIES_WITH_DETAILS(scopeKey),
			});
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.story(variables.id, scopeKey),
			});
		},
	});
};

export const useCreateStory = () => {
	const queryClient = useQueryClient();
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useMutation({
		mutationFn: async ({
			story,
		}: {
			story: Pick<Story, "name" | "assigned_to" | "environment" | "type">;
		}) => {
			const projectId = scope.projectId;
			if (!projectId)
				throw new Error("A project must be selected before creating a story");
			const { data, error } = await supabase
				.from(DB_TABLES.STORIES)
				.insert({
					...story,
					project_id: projectId,
				})
				.select()
				.single();
			if (error) throw new Error(error.message);
			return data as Story;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORIES(scopeKey) });
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.STORIES_WITH_DETAILS(scopeKey),
			});
		},
	});
};

export const useDeleteStory = () => {
	const queryClient = useQueryClient();
	const scope = useProjectScope();
	const scopeKey = scope.projectId ?? "all";
	return useMutation({
		mutationFn: async ({ storyId }: { storyId: string }) => {
			const { error: artifactsError } = await supabase
				.from(DB_TABLES.STORY_ARTIFACTS)
				.delete()
				.eq("story_id", storyId);
			if (artifactsError) throw new Error(artifactsError.message);
			const { error: storyError } = await supabase
				.from(DB_TABLES.STORIES)
				.delete()
				.eq("id", storyId);
			if (storyError) throw new Error(storyError.message);
			return { storyId };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORIES(scopeKey) });
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.STORIES_WITH_DETAILS(scopeKey),
			});
		},
	});
};
