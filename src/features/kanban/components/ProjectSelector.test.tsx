import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProjectSelector } from "@/features/kanban/components/ProjectSelector";
import { ProjectScopeProvider } from "@/shared/hooks/use-project-scope";
import { PROJECT_IDS } from "@/shared/constants/projects";

HTMLElement.prototype.hasPointerCapture = () => false;
HTMLElement.prototype.setPointerCapture = () => undefined;
HTMLElement.prototype.releasePointerCapture = () => undefined;

function renderSelector(profile: {
	role: string;
	project_id: string | null;
}): ReturnType<typeof render> {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>
			<ProjectScopeProvider profile={profile}>
				<ProjectSelector />
			</ProjectScopeProvider>
		</QueryClientProvider>,
	);
}

describe("ProjectSelector", () => {
	it("is hidden for regular users", () => {
		renderSelector({ role: "user", project_id: PROJECT_IDS.ONBOARDING });

		expect(
			screen.queryByRole("combobox", { name: "Proyecto" }),
		).not.toBeInTheDocument();
	});

	it("allows admins to switch projects", async () => {
		const user = userEvent.setup();
		renderSelector({ role: "admin", project_id: null });

		const selector = screen.getByRole("combobox", { name: "Proyecto" });
		expect(selector).toHaveTextContent("Onboarding");
		await user.click(selector);
		await user.click(screen.getByRole("option", { name: "Plataforma" }));

		expect(selector).toHaveTextContent("Plataforma");
	});
});
