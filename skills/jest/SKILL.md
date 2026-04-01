---
name: vitest
description: >
  Unit and component testing with Vitest and React Testing Library.
  Trigger: When writing or modifying tests for React components, custom hooks, or utility functions.
license: Apache-2.0
metadata:
  author: Galicia Version Tracker
  version: "1.0"
  scope: [ui, test]
  auto_invoke: "Writing component or hook tests"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
---

## When to Use

Use this skill when:

- Writing tests for React components (pages, UI components)
- Writing tests for custom hooks
- Writing tests for utility functions
- Mocking API calls, router, or context providers
- Testing user interactions (clicks, typing, form submission)

---

## Stack

| Tool                            | Role                                     |
| ------------------------------- | ---------------------------------------- |
| **Vitest**                      | Test runner (replaces Jest)              |
| **@testing-library/react**      | Component rendering and queries          |
| **@testing-library/user-event** | Realistic user interactions              |
| **@testing-library/jest-dom**   | DOM matchers (`toBeInTheDocument`, etc.) |
| **jsdom**                       | Browser environment simulation           |

Config: `vitest.config.ts` — env: jsdom, globals: true, setupFiles: `src/test/setup.ts`

---

## Critical Patterns

### Pattern 1: Component Test with Providers

Always wrap components with the required providers. Extract the render helper to keep tests clean.

```typescript
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import MyComponent from "./MyComponent";

// ✅ CORRECT - Reusable render helper with all required providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderComponent = (props = {}) => {
  const queryClient = createTestQueryClient();
  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter>
            <MyComponent {...props} />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    ),
  };
};
```

### Pattern 2: Mocking with `vi`

```typescript
// ✅ CORRECT - Mock react-router-dom navigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// ✅ CORRECT - Mock a custom hook
vi.mock("../hooks/useRecentSearches", () => ({
  useRecentSearches: () => ({
    recentSearches: [{ searchTerm: "MacBook Pro M3", timestamp: "2026-01-01T00:00:00Z" }],
    isLoading: false,
    error: null,
  }),
}));

// ✅ CORRECT - Mock a layout component (to isolate the component under test)
vi.mock("@/shared/components/layout/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Pattern 3: Testing Behavior (Rendering)

```typescript
// ✅ CORRECT - Test what the user sees, not implementation
describe("Search", () => {
  describe("rendering", () => {
    it("should render the search input", () => {
      renderComponent();
      expect(
        screen.getByPlaceholderText("Search products to compare prices..."),
      ).toBeInTheDocument();
    });

    it("should render the search button", () => {
      renderComponent();
      expect(
        screen.getByRole("button", { name: /search/i }),
      ).toBeInTheDocument();
    });
  });
});

// ❌ WRONG - Testing implementation details
it("calls useState with false", () => {
  const spy = vi.spyOn(React, "useState");
  renderComponent();
  expect(spy).toHaveBeenCalledWith(false);
});
```

### Pattern 4: Testing User Interactions

Always use `userEvent` over `fireEvent` for realistic interactions.

```typescript
// ✅ CORRECT - userEvent for realistic browser behavior
it("should navigate to results on search submit", async () => {
  const { user } = renderComponent();

  const searchInput = screen.getByPlaceholderText(
    "Search products to compare prices...",
  );
  await user.type(searchInput, "macbook");
  await user.click(screen.getByRole("button", { name: /search/i }));

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/results?q=macbook");
  });
});

// ✅ CORRECT - Verify no action on empty input
it("should not navigate when search is empty", async () => {
  const { user } = renderComponent();
  await user.click(screen.getByRole("button", { name: /search/i }));
  expect(mockNavigate).not.toHaveBeenCalled();
});

// ❌ WRONG - fireEvent doesn't simulate real events
fireEvent.click(button);
```

### Pattern 5: Testing Async States

```typescript
// ✅ CORRECT - waitFor for async updates
it("should show results after search", async () => {
  const { user } = renderComponent();

  await user.type(screen.getByRole("searchbox"), "laptop");
  await user.click(screen.getByRole("button", { name: /search/i }));

  await waitFor(() => {
    expect(screen.getByText("Results for: laptop")).toBeInTheDocument();
  });
});

// ✅ CORRECT - findBy* for elements that appear asynchronously
it("should show loading spinner", async () => {
  renderComponent();
  const spinner = await screen.findByRole("status");
  expect(spinner).toBeInTheDocument();
});
```

### Pattern 6: Testing Hook

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProductData } from "./useProductData";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

// ✅ CORRECT - Test hook behavior via renderHook
it("should return products when fetch succeeds", async () => {
  const { result } = renderHook(() => useProductData(), { wrapper });

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.products).toHaveLength(3);
});
```

---

## Query Priority (getBy → findBy → queryBy)

| Query      | Use when                       | Throws if not found  |
| ---------- | ------------------------------ | -------------------- |
| `getBy*`   | Element is always present      | ✅ Yes               |
| `findBy*`  | Element appears asynchronously | ✅ Yes               |
| `queryBy*` | Element may not be present     | ❌ No (returns null) |

**Preferred query order** (most accessible first):

1. `getByRole` — buttons, headings, inputs
2. `getByLabelText` — form fields
3. `getByPlaceholderText` — inputs
4. `getByText` — visible text
5. `getByTestId` — last resort, use `data-testid`

---

## Decision Tree

```
Writing a test?
  ├─ Testing a React component?
  │  ├─ Needs router? → wrap with MemoryRouter
  │  ├─ Needs queries/mutations? → wrap with QueryClientProvider (retry: false)
  │  ├─ Needs auth? → wrap with AuthProvider
  │  └─ Extract all providers into a renderXxx() helper
  │
  ├─ Testing a custom hook?
  │  └─ Use renderHook() with wrapper for providers
  │
  └─ Testing a utility function?
     └─ Plain describe/it, no rendering needed
```

---

## Best Practices

✅ **Test behavior, not implementation** — what the user sees/does
✅ **Always use `userEvent.setup()`** — not the legacy `userEvent` directly
✅ **`retry: false` in test QueryClient** — prevents retries from slowing tests
✅ **`vi.clearAllMocks()` in `beforeEach`** — clean state between tests
✅ **Descriptive test names** — "should navigate to results on search submit"
✅ **Arrange-Act-Assert** — clear test structure
✅ **Group with `describe`** — rendering / interactions / edge cases

---

## Common Mistakes

❌ Using `fireEvent` instead of `userEvent`
❌ Not wrapping with `QueryClientProvider` when the component uses queries
❌ Asserting on implementation details (useState, internal variables)
❌ Missing `await` on `userEvent` calls (they are async)
❌ Using `getBy*` for elements that might not be present (use `queryBy*`)
❌ Not resetting mocks between tests

---

## Commands

```bash
pnpm test:run        # Run all tests once (CI mode)
pnpm test            # Run tests in watch mode
pnpm test:run --reporter=verbose   # Verbose output
```

---

## File Structure

```
src/
├── test/
│   ├── setup.ts              # Global test setup (@testing-library/jest-dom)
│   └── example.test.ts       # Minimal test example
│
└── features/{name}/
    ├── pages/
    │   ├── MyPage.tsx
    │   └── MyPage.test.tsx   # Co-located with component
    ├── components/
    │   ├── MyCard.tsx
    │   └── MyCard.test.tsx
    └── hooks/
        ├── useMyHook.ts
        └── useMyHook.test.ts
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [user-event v14](https://testing-library.com/docs/user-event/intro)
