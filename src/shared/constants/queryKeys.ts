export const QUERY_KEYS = {
	USERS: (scope: string) => ["users", scope] as const,
	ARTIFACTS: (scope: string) => ["artifactsv2", scope] as const,
	STORIES: (scope: string) => ["stories", scope] as const,
	STORIES_WITH_DETAILS: (scope: string) =>
		["stories", "with-details", scope] as const,
	story: (id: string, scope: string) => ["story", id, scope] as const,
	storyArtifacts: (storyId: string, scope: string) =>
		["story-artifacts-v2", storyId, scope] as const,
};
