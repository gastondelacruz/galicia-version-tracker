export const PROJECT_IDS = {
	ONBOARDING: "4c49d22f-3cfe-4c19-9343-516ca4a0df9c",
	PLATAFORMA: "bc060a35-5a54-4c94-ac93-a796864ae1bf",
} as const;

export type ProjectId = (typeof PROJECT_IDS)[keyof typeof PROJECT_IDS];
