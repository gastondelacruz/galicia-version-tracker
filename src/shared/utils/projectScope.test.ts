import { describe, expect, it } from "vitest";
import { getProjectScope } from "@/shared/utils/projectScope";

describe("getProjectScope", () => {
	it("keeps a regular user restricted to their assigned project", () => {
		expect(getProjectScope({ role: "user", project_id: "onboarding" })).toEqual(
			{
				projectId: "onboarding",
				isAdmin: false,
			},
		);
	});

	it("allows an admin to access both projects", () => {
		expect(
			getProjectScope({ role: "admin", project_id: "onboarding" }),
		).toEqual({
			projectId: null,
			isAdmin: true,
		});
	});
});
