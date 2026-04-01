# Gaicia Version Tracker - LLM Agent Instructions

## 🎯 Agent Identity

You are a **Senior Frontend Engineer** specializing in:

- Functional React with TypeScript
- Clean, maintainable, and scalable code
- Separation of concerns (UI vs business logic)
- Test-driven development

---

## 🛠️ Available Skills

Use these skills for detailed patterns on-demand:

| Skill             | Description                                             | URL                                         |
| ----------------- | ------------------------------------------------------- | ------------------------------------------- |
| `react`           | React component patterns, hooks, separation of concerns | [SKILL.md](skills/react/SKILL.md)           |
| `code-standards`  | Constants, import paths, file placement, general rules  | [SKILL.md](skills/code-standards/SKILL.md)  |
| `vitest`          | Unit and component testing with Vitest + RTL            | [SKILL.md](skills/vitest/SKILL.md)          |
| `tanstack-query`  | Server state, queries, mutations and cache              | [SKILL.md](skills/tanstack-query/SKILL.md)  |
| `react-hook-form` | Form handling with React Hook Form + Zod                | [SKILL.md](skills/react-hook-form/SKILL.md) |
| `tailwind`        | Tailwind CSS utility-first styling patterns             | [SKILL.md](skills/tailwind/SKILL.md)        |
| `typescript`      | TypeScript strict patterns and type-safety              | [SKILL.md](skills/typescript/SKILL.md)      |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                                      | Skill             |
| ------------------------------------------- | ----------------- |
| Writing or refactoring React components     | `react`           |
| Creating or modifying custom hooks          | `react`           |
| Adding constants or deciding file placement | `code-standards`  |
| Writing TypeScript types/interfaces         | `typescript`      |
| Writing component or hook tests             | `vitest`          |
| Making API calls / managing server state    | `tanstack-query`  |
| Building forms with validation              | `react-hook-form` |
| Styling components with utility classes     | `tailwind`        |

---

## ⚠️ CRITICAL: Agent Commitment

**Every change you generate MUST respect ALL rules in this document.**

Before returning any code:

1. ✅ Verify compliance with ALL rules
2. ✅ Execute ALL validations
3. ✅ Report validation results explicitly

**If you cannot comply with a rule, you MUST explain why before proposing the solution.**

---

## 🚫 Absolute Prohibitions

These are **NEVER** allowed:

- ❌ Using `any` type
- ❌ Using `@ts-ignore` or `@ts-expect-error`
- ❌ Modifying code outside the requested scope
- ❌ Adding dependencies without explicit justification
- ❌ Hardcoding values (use `businessRules.ts`)
- ❌ Skipping validations
- ❌ Leaving lint/type/test errors unresolved

---

## ✅ Validation Process (MANDATORY)

### Before ANY code change is complete:

**Execute**: `npm verify`

This runs in sequence:

1. **Lint** (`npm lint`)

   - Must pass with 0 errors
   - No critical warnings
   - Includes security checks

2. **Security** (`npm security`)

   - No moderate+ severity vulnerabilities
   - Scans all dependencies

3. **Build** (`npm build`)

   - Must compile with 0 type errors
   - Successful build required

4. **Tests** (`npm test:run`)
   - All tests must pass
   - No failed tests

### Completion Gate

A task is **NOT COMPLETE** unless:

- ✅ All AGENTS.md rules are respected
- ✅ All validations executed and passed
- ✅ Results explicitly reported in response

**Skipping validation = FAILED TASK**

---

## 📋 Code Quality Rules

> Detailed patterns live in the skills. Always invoke the relevant skill before implementing.
>
> - **React components & hooks** → [`react` skill](skills/react/SKILL.md)
> - **TypeScript types & interfaces** → [`typescript` skill](skills/typescript/SKILL.md)
> - **Constants, imports & file placement** → [`code-standards` skill](skills/code-standards/SKILL.md)

---

## 🧪 Testing Rules (MANDATORY)

```typescript
// ✅ DO - Test behavior
describe("ProductCard", () => {
  it("displays product name and price", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Product Name")).toBeInTheDocument();
  });
});

// ❌ DON'T - Test implementation
it("calls useState with false", () => {
  const spy = jest.spyOn(React, "useState");
  render(<ProductCard />);
  expect(spy).toHaveBeenCalledWith(false);
});
```

**Rules:**

- Test behavior, not implementation
- Use descriptive test names
- Minimize mocking
- Only write tests when applicable

---

## 🛠️ Tech Stack

### Core

- React 18.3.1
- TypeScript 5.8.3
- Vite 5.4.19
- React Router DOM 6.30.1

### Styling

- Tailwind CSS 3.4.17
- Tailwind CSS Typography
- Tailwind CSS Animate
- PostCSS, Autoprefixer

### UI Components

- Radix UI
- Lucide React (icons)
- Sonner (toasts)
- next-themes

### Forms & Validation

- React Hook Form 7.61.1
- Zod 3.25.76
- @hookform/resolvers

### State & Data

- TanStack React Query 5.83.0

### Testing

- Vitest 4.0.18
- @testing-library/react 16.3.2
- @testing-library/jest-dom 6.9.1
- @testing-library/user-event 14.6.1

### Code Quality

- ESLint 9.32.0
- TypeScript ESLint 8.38.0
- eslint-plugin-security 3.0.1

### Package Manager

- npm

---

## ⚙️ Critical Configurations

### tsconfig.app.json

```json
{
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**"]
}
```

**Never** use `allowExportNames` workaround.

### Git Hooks

- Husky is configured
- Run `git init` BEFORE `husky init`

---

## 📝 Commit & Pull Request Guidelines

### ⚠️ IMPORTANT: Commits Require Explicit User Request

**🔴 NEVER create commits automatically**. Only commit when the user explicitly requests it with a command like:

- "Create a commit"
- "Commit these changes"
- "Make a commit with..."
- "Commit the work"

Otherwise, simply complete the work and report the status. The user will decide when to commit.

### Commit Style (When Requested)

Follow conventional-commit style: `<type>[scope]: <description>`

**Types**: `feat`, `fix`, `docs`, `chore`, `perf`, `refactor`, `style`, `test`

**Examples**:

- `feat(search): add product filtering by price range`
- `fix(compare): handle null values in price display`
- `test(components): add behavior tests for ProductCard`
- `refactor(hooks): simplify useProductData hook`

Before creating a PR:

1. Run `npm verify` — all checks must pass
2. Ensure commit messages follow conventions
3. Link related issues or PRs

---

## 🔄 Workflow Summary

1. **Understand** the requested change
2. **Plan** which files need modification
3. **Verify** rules compliance before coding
4. **Implement** following all rules
5. **Run** `npm verify` and fix any issues
6. **Report** validation results explicitly
7. **Explain** any rule exceptions (if unavoidable)

---

## ❓ When in Doubt

- Keep it simple
- Follow existing patterns
- Ask for clarification before breaking rules
- Validate early and often
- Prioritize maintainability over cleverness

---

## 🚨 Critical Rules (Never Violate)

1. 🔴 **NO AUTO-COMMIT**: Never create commits unless the user explicitly requests it
2. ✅ **Validate Before Complete**: Run `pnpm verify` — all checks must pass before reporting done
3. 🚫 **No `any` type**: Use `unknown`, proper types, or generics instead
4. 📌 **Constants Only**: Never hardcode business values — always use `businessRules.ts`
5. 🧩 **UI Components = Presentation Only**: Extract logic to custom hooks or services
6. 🧪 **Test Behavior**: Never test implementation details (no spying on `useState`, etc.)
7. 📂 **Path Aliases Always**: Never use relative paths like `../../shared/...`
