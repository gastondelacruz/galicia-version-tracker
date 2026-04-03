import type { Story } from "@/shared/types";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { DB_TABLES } from "@/shared/constants/tables";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/supabaseClient";

export const useStoriesWithDetails = () => {
  return useQuery({
    queryKey: QUERY_KEYS.STORIES_WITH_DETAILS,
    queryFn: async (): Promise<Story[]> => {
      const { data, error } = await supabase
        .from(DB_TABLES.STORIES)
        .select(
          `
          *,
          assigned_user:${DB_TABLES.PEOPLE}!assigned_to(
            id,
            name,
            created_at
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data as Story[];
    },
  });
};

export const useUpdateStoryBasicInfo = () => {
  const queryClient = useQueryClient();

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
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.STORIES_WITH_DETAILS });
      const previousStories = queryClient.getQueryData<Story[]>(QUERY_KEYS.STORIES_WITH_DETAILS);
      queryClient.setQueryData<Story[]>(QUERY_KEYS.STORIES_WITH_DETAILS, (old) =>
        old?.map((story) => (story.id === id ? { ...story, ...updates } : story)) ?? []
      );
      return { previousStories };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(QUERY_KEYS.STORIES_WITH_DETAILS, context.previousStories);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.story(variables.id) });
    },
  });
};

export const useUpdateStory = () => {
  const queryClient = useQueryClient();

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

      const { data, error: storyError } = await supabase
        .from(DB_TABLES.STORIES)
        .update(storyUpdates)
        .eq("id", id)
        .select()
        .single();

      if (storyError) throw new Error(storyError.message);
      return data as Story;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.story(variables.id) });
    },
  });
};

export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      story,
    }: {
      story: Pick<Story, "name" | "assigned_to" | "environment" | "type">;
    }) => {
      const { data: storyData, error: storyError } = await supabase
        .from(DB_TABLES.STORIES)
        .insert({
          name: story.name,
          assigned_to: story.assigned_to,
          environment: story.environment,
          type: story.type,
        })
        .select()
        .single();

      if (storyError) throw new Error(storyError.message);

      return storyData as Story;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORIES });
    },
  });
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storyId }: { storyId: string }) => {
      const { error: deleteStoryArtifactsError } = await supabase
        .from(DB_TABLES.STORY_ARTIFACTS)
        .delete()
        .eq("story_id", storyId);

      if (deleteStoryArtifactsError)
        throw new Error(deleteStoryArtifactsError.message);

      const { error: deleteStoryError } = await supabase
        .from(DB_TABLES.STORIES)
        .delete()
        .eq("id", storyId);

      if (deleteStoryError) throw new Error(deleteStoryError.message);

      return { storyId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORIES });
    },
  });
};
