export const PROFILE_ROLES = {
	USER: "user",
	ADMIN: "admin",
} as const;

export type ProfileRole = (typeof PROFILE_ROLES)[keyof typeof PROFILE_ROLES];

type ProfileRecord = {
	readonly role: string;
	readonly project_id: string | null;
};

export type ProjectScope = {
	readonly projectId: string | null;
	readonly isAdmin: boolean;
};

export function getProjectScope(profile: ProfileRecord): ProjectScope {
	const isAdmin = profile.role === PROFILE_ROLES.ADMIN;
	return {
		projectId: isAdmin ? null : profile.project_id,
		isAdmin,
	};
}
