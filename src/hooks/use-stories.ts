import { Artifact, ArtifactV2, Person, Story, StoryWithDetails } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export const useStoriesWithDetails = () => {
  return useQuery({
    queryKey: ["stories", "with-details"],
    queryFn: async (): Promise<StoryWithDetails[]> => {
      const { data, error } = await supabase
        .from("stories")
        .select(
          `
          *,
          assigned_user:people!assigned_to(
            id,
            name,
            created_at
          ),
          artifacts(
            id,
            story_id,
            name,
            version,
            created_at
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data as StoryWithDetails[];
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<Person[]> => {
      const { data, error } = await supabase.from("people").select("*");

      if (error) throw new Error(error.message);
      return data as Person[];
    },
  });
};

export const useStoryWithDetails = (storyId: string) => {
  return useQuery({
    queryKey: ["story", storyId, "with-details"],
    queryFn: async (): Promise<StoryWithDetails> => {
      const { data, error } = await supabase
        .from("stories")
        .select(
          `
          *,
          assigned_user:people!assigned_to(
            id,
            name,
            created_at
          ),
          artifacts(
            id,
            story_id,
            name,
            version,
            created_at
          )
        `
        )
        .eq("id", storyId)
        .single();

      if (error) throw new Error(error.message);
      return data as StoryWithDetails;
    },
    enabled: !!storyId,
  });
};

export const useStoriesByEnvironment = (environment: string) => {
  return useQuery({
    queryKey: ["stories", "environment", environment],
    queryFn: async (): Promise<StoryWithDetails[]> => {
      const { data, error } = await supabase
        .from("stories")
        .select(
          `
            *,
            assigned_user:people!assigned_to(id, name),
            artifacts(id, name, version)
          `
        )
        .eq("environment", environment)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data as StoryWithDetails[];
    },
    enabled: !!environment,
  });
};

export const updateStoryArtifacts = async (
  storyId: string,
  artifacts: Array<Omit<Artifact, "story_id" | "created_at"> & { id?: string }>
) => {
  const { data: existingArtifacts, error: fetchError } = await supabase
    .from("artifacts")
    .select("id")
    .eq("story_id", storyId);

  if (fetchError) throw new Error(fetchError.message);

  const existingIds = existingArtifacts?.map((a) => a.id) || [];
  const updatedIds = artifacts.filter((a) => a.id).map((a) => a.id as string);

  const toDelete = existingIds.filter((id) => !updatedIds.includes(id));
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("artifacts")
      .delete()
      .in("id", toDelete);

    if (deleteError) throw new Error(deleteError.message);
  }

  const toUpdate = artifacts.filter((a) => a.id);
  const toInsert = artifacts.filter((a) => !a.id);

  if (toUpdate.length > 0) {
    const { error: updateError } = await supabase.from("artifacts").upsert(
      toUpdate.map((artifact) => ({
        id: artifact.id!,
        name: artifact.name,
        version: artifact.version,
        story_id: storyId,
      })),
      { onConflict: "id" }
    );

    if (updateError) throw new Error(updateError.message);
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from("artifacts").insert(
      toInsert.map((artifact) => ({
        name: artifact.name,
        version: artifact.version,
        story_id: storyId,
      }))
    );

    if (insertError) throw new Error(insertError.message);
  }
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["story", variables.id] });
    },
  });
};

export const useUpdateStoryArtifacts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storyId,
      artifacts,
    }: {
      storyId: string;
      artifacts: Array<
        Omit<Artifact, "story_id" | "created_at"> & { id?: string }
      >;
    }) => {
      await updateStoryArtifacts(storyId, artifacts);
      return { storyId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["story", data.storyId] });
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
      > & {
        artifacts?: Array<
          Omit<Artifact, "story_id" | "created_at"> & { id?: string }
        >;
      };
    }) => {
      const { name, assigned_to, environment, artifacts, type } = updates;

      const storyUpdates: Partial<
        Pick<Story, "name" | "assigned_to" | "environment" | "type">
      > = {};
      if (name !== undefined) storyUpdates.name = name;
      if (assigned_to !== undefined) storyUpdates.assigned_to = assigned_to;
      if (environment !== undefined) storyUpdates.environment = environment;
      if (type !== undefined) storyUpdates.type = type;

      let storyData: Story | undefined;
      if (Object.keys(storyUpdates).length > 0) {
        const { data, error: storyError } = await supabase
          .from("stories")
          .update(storyUpdates)
          .eq("id", id)
          .select()
          .single();

        if (storyError) throw new Error(storyError.message);
        storyData = data;
      }

      if (artifacts && artifacts.length > 0) {
        await updateStoryArtifacts(id, artifacts);
      }

      return storyData as Story;
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
      artifacts,
    }: {
      story: Pick<Story, "name" | "assigned_to" | "environment" | "type">;
      artifacts?: Array<Pick<Artifact, "name" | "version">>;
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

      if (artifacts && artifacts.length > 0) {
        await updateStoryArtifacts(storyData.id, artifacts);
      }

      return storyData as Story;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};

export const useStoryArtifactsV2 = (storyId: string) => {
  return useQuery({
    queryKey: ["story-artifacts-v2", storyId],
    queryFn: async (): Promise<ArtifactV2[]> => {
      const { data, error } = await supabase
        .from("story_artifacts")
        .select("artifactsv2(*)")
        .eq("story_id", storyId);
      if (error) throw new Error(error.message);
      return (data?.map((row: any) => row.artifactsv2).filter(Boolean) ?? []) as ArtifactV2[];
    },
    enabled: !!storyId,
  });
};

export const useAddStoryArtifactV2 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storyId, artifactId }: { storyId: string; artifactId: string }) => {
      const { error } = await supabase
        .from("story_artifacts")
        .insert({ story_id: storyId, artifact_id: artifactId });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { storyId }) => {
      queryClient.invalidateQueries({ queryKey: ["story-artifacts-v2", storyId] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};

export const useRemoveStoryArtifactV2 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storyId, artifactId }: { storyId: string; artifactId: string }) => {
      const { error } = await supabase
        .from("story_artifacts")
        .delete()
        .eq("story_id", storyId)
        .eq("artifact_id", artifactId);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { storyId }) => {
      queryClient.invalidateQueries({ queryKey: ["story-artifacts-v2", storyId] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};

export const useArtifactsV2 = () => {
  return useQuery({
    queryKey: ["artifactsv2"],
    queryFn: async (): Promise<ArtifactV2[]> => {
      const { data, error } = await supabase
        .from("artifactsv2")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw new Error(error.message);
      return data as ArtifactV2[];
    },
  });
};

export const useCreateArtifactV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, type }: Pick<ArtifactV2, "name" | "type">) => {
      const { data, error } = await supabase
        .from("artifactsv2")
        .insert({ name, type })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as ArtifactV2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artifactsv2"] });
    },
  });
};

export const useUpdateArtifactV2 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, type }: { id: string; name: string; type: "FRONT" | "BACK" }) => {
      const { data, error } = await supabase
        .from("artifactsv2")
        .update({ name, type })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ArtifactV2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artifactsv2"] });
    },
  });
};

export const useDeleteArtifactV2 = () => {
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
      const { data: artifacts, error: fetchError } = await supabase
        .from("artifacts")
        .select("id")
        .eq("story_id", storyId);

      if (fetchError) throw new Error(fetchError.message);

      if (artifacts && artifacts.length > 0) {
        const artifactIds = artifacts.map((a) => a.id);
        const { error: deleteArtifactsError } = await supabase
          .from("artifacts")
          .delete()
          .in("id", artifactIds);

        if (deleteArtifactsError) throw new Error(deleteArtifactsError.message);
      }

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
