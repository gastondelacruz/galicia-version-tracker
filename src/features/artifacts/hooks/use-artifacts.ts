import { Artifact } from "@/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/supabaseClient";

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
