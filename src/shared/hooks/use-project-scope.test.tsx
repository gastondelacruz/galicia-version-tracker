import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
	ProjectScopeProvider,
	useProjectScope,
} from "@/shared/hooks/use-project-scope";
import { PROJECT_IDS } from "@/shared/constants/projects";

function renderWithScope(profile: {
	role: string;
	project_id: string | null;
}): ReturnType<typeof render> {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>
			<ProjectScopeProvider profile={profile}>
				<ScopeConsumer />
			</ProjectScopeProvider>
		</QueryClientProvider>,
	);
}

function ScopeConsumer(): JSX.Element {
	const { projectId, isAdmin } = useProjectScope();
	return <span>{`${isAdmin ? "admin" : "user"}:${projectId}`}</span>;
}

describe("ProjectScopeProvider", () => {
	it("initializes admins to onboarding and changes the effective project", async () => {
		const user = userEvent.setup();
		const queryClient = new QueryClient();
		render(
			<QueryClientProvider client={queryClient}>
				<ProjectScopeProvider profile={{ role: "admin", project_id: null }}>
					<button type="button" onClick={() => undefined}>
						noop
					</button>
					<ScopeConsumer />
				</ProjectScopeProvider>
			</QueryClientProvider>,
		);

		expect(
			screen.getByText(`admin:${PROJECT_IDS.ONBOARDING}`),
		).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "noop" }));
		expect(
			screen.getByText(`admin:${PROJECT_IDS.ONBOARDING}`),
		).toBeInTheDocument();
	});

	it("keeps regular users on their profile project", () => {
		renderWithScope({ role: "user", project_id: PROJECT_IDS.PLATAFORMA });

		expect(
			screen.getByText(`user:${PROJECT_IDS.PLATAFORMA}`),
		).toBeInTheDocument();
	});
});
