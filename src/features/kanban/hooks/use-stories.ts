import { Artifact, Person, Story } from "@/shared/types";
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

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<Person[]> => {
      const { data, error } = await supabase
        .from("people")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data as Person[];
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data, error } = await supabase
        .from("people")
        .insert({ name })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("people")
        .update({ name })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("people").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
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

export const useStoryArtifacts = (storyId: string) => {
  return useQuery({
    queryKey: ["story-artifacts-v2", storyId],
    queryFn: async (): Promise<Artifact[]> => {
      const { data, error } = await supabase
        .from("story_artifacts")
        .select("artifactsv2(*)")
        .eq("story_id", storyId);
      if (error) throw new Error(error.message);
      return (data
        ?.flatMap((row: { artifactsv2: Artifact[] }) => row.artifactsv2)
        .filter(Boolean) ?? []) as Artifact[];
    },
    enabled: !!storyId,
  });
};

export const useAddStoryArtifact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      storyId,
      artifactId,
    }: {
      storyId: string;
      artifactId: string;
    }) => {
      const { error } = await supabase
        .from("story_artifacts")
        .insert({ story_id: storyId, artifact_id: artifactId });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { storyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["story-artifacts-v2", storyId],
      });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};

export const useRemoveStoryArtifact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      storyId,
      artifactId,
    }: {
      storyId: string;
      artifactId: string;
    }) => {
      const { error } = await supabase
        .from("story_artifacts")
        .delete()
        .eq("story_id", storyId)
        .eq("artifact_id", artifactId);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { storyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["story-artifacts-v2", storyId],
      });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};

export const useArtifacts = () => {
  return useQuery({
    queryKey: ["artifactsv2"],
    queryFn: async (): Promise<Artifact[]> => {
      const { data, error } = await supabase
        .from("artifactsv2")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw new Error(error.message);
      return data as Artifact[];
    },
  });
};

export const useCreateArtifact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, type }: Pick<Artifact, "name" | "type">) => {
      const { data, error } = await supabase
        .from("artifactsv2")
        .insert({ name, type })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Artifact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artifactsv2"] });
    },
  });
};

export const useUpdateArtifact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      type,
    }: {
      id: string;
      name: string;
      type: "FRONT" | "BACK";
    }) => {
      const { data, error } = await supabase
        .from("artifactsv2")
        .update({ name, type })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Artifact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artifactsv2"] });
    },
  });
};

export const useDeleteArtifact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("artifactsv2")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artifactsv2"] });
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
