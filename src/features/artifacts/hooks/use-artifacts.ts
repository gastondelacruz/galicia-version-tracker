import type { Artifact } from "@/shared/types";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { DB_TABLES } from "@/shared/constants/tables";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/supabaseClient";

export const useArtifacts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ARTIFACTS,
    queryFn: async (): Promise<Artifact[]> => {
      const { data, error } = await supabase
        .from(DB_TABLES.ARTIFACTS)
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
        .from(DB_TABLES.ARTIFACTS)
        .insert({ name, type })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Artifact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ARTIFACTS });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ARTIFACTS });
    },
  });
};

export const useDeleteArtifact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(DB_TABLES.ARTIFACTS)
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ARTIFACTS });
    },
  });
};

export const useStoryArtifacts = (storyId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.storyArtifacts(storyId),
    queryFn: async (): Promise<Artifact[]> => {
      const { data, error } = await supabase
        .from(DB_TABLES.STORY_ARTIFACTS)
        .select(`${DB_TABLES.ARTIFACTS}(*)`)
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
        .from(DB_TABLES.STORY_ARTIFACTS)
        .insert({ story_id: storyId, artifact_id: artifactId });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { storyId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.storyArtifacts(storyId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORIES });
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
        .from(DB_TABLES.STORY_ARTIFACTS)
        .delete()
        .eq("story_id", storyId)
        .eq("artifact_id", artifactId);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { storyId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.storyArtifacts(storyId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORIES });
    },
  });
};
