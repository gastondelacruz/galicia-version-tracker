export const QUERY_KEYS = {
  USERS: ["users"] as const,
  ARTIFACTS: ["artifactsv2"] as const,
  STORIES: ["stories"] as const,
  STORIES_WITH_DETAILS: ["stories", "with-details"] as const,
  story: (id: string) => ["story", id] as const,
  storyArtifacts: (storyId: string) => ["story-artifacts-v2", storyId] as const,
};
