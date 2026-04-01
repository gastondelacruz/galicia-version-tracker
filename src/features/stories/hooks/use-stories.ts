import { Story } from "@/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/supabaseClient";

export const useStoriesWithDetails = () => {
  return useQuery({
    queryKey: ["stories", "with-details"],
    queryFn: async (): Promise<Story[]> => {
      const { data, error } = await supabase
        .from("stories")
        .select(
          `
          *,
          assigned_user:people!assigned_to(
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
        .from("stories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Story;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["stories", "with-details"] });
      const previousStories = queryClient.getQueryData<Story[]>(["stories", "with-details"]);
      queryClient.setQueryData<Story[]>(["stories", "with-details"], (old) =>
        old?.map((story) => (story.id === id ? { ...story, ...updates } : story)) ?? []
      );
      return { previousStories };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(["stories", "with-details"], context.previousStories);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["story", variables.id] });
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
        .from("stories")
        .update(storyUpdates)
        .eq("id", id)
        .select()
        .single();

      if (storyError) throw new Error(storyError.message);
      return data as Story;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["story", variables.id] });
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
        .from("stories")
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
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storyId }: { storyId: string }) => {
      const { error: deleteStoryArtifactsError } = await supabase
        .from("story_artifacts")
        .delete()
        .eq("story_id", storyId);

      if (deleteStoryArtifactsError)
        throw new Error(deleteStoryArtifactsError.message);

      const { error: deleteStoryError } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (deleteStoryError) throw new Error(deleteStoryError.message);

      return { storyId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};
