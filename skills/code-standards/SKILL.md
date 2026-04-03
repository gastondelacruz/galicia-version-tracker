---
name: code-standards
description: >
  General code quality standards for the Galicia Version Tracker frontend.
  Trigger: When adding constants, configuring imports, deciding file placement, or applying project-wide conventions.
license: Apache-2.0
metadata:
  author: Galicia Version Tracker
  version: "1.0"
  scope: [root, ui]
  auto_invoke: "Adding constants, configuring imports, or deciding file placement"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
---

## When to Use

Use this skill when:

- Adding or looking up a business constant
- Deciding where to place a new file (shared vs feature)
- Writing import statements
- Applying general code quality conventions across the project

---

## Constants & Business Rules (CRITICAL)

**All constants live in**: `src/shared/constants/businessRules.ts`

### Never Hardcode — Always Use Constants

```typescript
// ❌ WRONG
const sources = ["Amazon", "Best Buy", "Walmart"];
await new Promise((resolve) => setTimeout(resolve, 1000));
setError("Invalid credentials");

// ✅ CORRECT
import {
  AVAILABLE_SOURCES,
  SIMULATION_DELAYS_MS,
  ERROR_MESSAGES,
} from "@/shared/constants/businessRules";

const sources = AVAILABLE_SOURCES;
await new Promise((resolve) => setTimeout(resolve, SIMULATION_DELAYS_MS.LOGIN));
setError(ERROR_MESSAGES.INVALID_CREDENTIALS);
```

### Adding a New Constant

1. Open `src/shared/constants/businessRules.ts`
2. Add to the relevant group (or create a new group)
3. Use `as const` for type safety
4. Use `SCREAMING_SNAKE_CASE`

```typescript
// ✅ CORRECT constant definition
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  NETWORK_ERROR: "Network error. Please try again.",
} as const;

export const SIMULATION_DELAYS_MS = {
  LOGIN: 1000,
  SEARCH: 500,
} as const;
```

---

## Import Paths (MANDATORY)

Always use `@/` path aliases. Never use relative paths crossing feature/shared boundaries.

```typescript
// ✅ CORRECT
import { Button } from "@/shared/components/ui-custom";
import { Layout } from "@/shared/components/layout/Layout";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { ROUTES } from "@/shared/constants/businessRules";
import { Product } from "@/shared/types";

// ❌ WRONG
import { Button } from "../../shared/components/ui-custom";
import { ROUTES } from "../constants/businessRules";
```

---

## File Placement Decision

**Rule**: Is this used by more than one feature?

```
New file needed?
  ├─ Used by 2+ features or truly global?
  │  └─ → src/shared/
  │        ├─ components/ui-custom/   # Reusable UI
  │        ├─ hooks/                  # Shared hooks
  │        ├─ types/                  # Shared types
  │        ├─ utils/                  # Shared utilities
  │        ├─ pages/                  # Pages shared across features (e.g. NotFound)
  │        └─ constants/businessRules.ts
  │
  └─ Used by exactly one feature?
     └─ → src/features/{name}/
           ├─ components/
           ├─ hooks/
           ├─ types/
           ├─ validations/
           └─ pages/             # Pages that belong to this feature
```

### Pages Placement Rule

Pages follow the same scope rule as all other files:

| Situation | Location |
| --- | --- |
| Page belongs to a single feature | `src/features/{name}/pages/` |
| Page is shared / not feature-specific (e.g. `NotFound`, `Landing`) | `src/shared/pages/` |

```typescript
// ✅ feature-specific page
src/features/auth/pages/Login.tsx
src/features/kanban/pages/Dashboard.tsx

// ✅ shared page (no single owner)
src/shared/pages/NotFound.tsx
```

### Project Structure Reference

```
src/
├── shared/                      # 🌍 GLOBAL (used by 2+ features)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives (never modify)
│   │   ├── ui-custom/          # Custom reusable components
│   │   └── layout/             # Layout, Navbar
│   ├── hooks/                  # Shared hooks
│   ├── types/                  # Shared TypeScript types
│   ├── utils/                  # Utility functions
│   ├── pages/                  # Shared pages (NotFound, etc.)
│   └── constants/
│       └── businessRules.ts    # ⚠️ ALL CONSTANTS HERE
│
├── features/                   # 📦 LOCAL (feature-specific)
│   ├── auth/
│   │   └── pages/              # Login, Register, etc.
│   ├── stories/
│   │   ├── components/         # AddStoryDialog, EditStoryDialog, StoryCard
│   │   ├── hooks/              # use-stories.ts
│   │   └── validations/        # storySchema.ts
│   ├── artifacts/
│   │   ├── components/         # AddArtifactDialog, ArtifactSelector
│   │   ├── hooks/              # use-artifacts.ts
│   │   └── validations/        # artifactSchema.ts
│   ├── users/
│   │   ├── components/         # AddUserDialog, PersonFilter
│   │   └── hooks/              # use-users.ts
│   └── kanban/
│       ├── components/         # KanbanBoard, KanbanColumn (solo el board)
│       ├── store/              # kanbanStore.ts
│       └── pages/              # Dashboard.tsx
│
├── context/                    # React Context providers
└── infrastructure/             # Supabase, queryClient, external services
```

---

## General Code Quality Rules

### DRY & Simplicity

✅ Prefer simple code over complex solutions
✅ Follow existing patterns before introducing new ones
✅ Extract repeated logic to shared hooks or utils
✅ Write self-documenting code — names over comments

### TypeScript Discipline

✅ Type EVERYTHING: props, state, function return values, hooks
✅ Use `type` over `interface` (except for declaration merging)
✅ Use `readonly` for data that shouldn't mutate
✅ Use `unknown` instead of `any`

### Consistency

✅ Match naming conventions of the surrounding code
✅ Match file structure of the surrounding feature
✅ If in doubt, look at an existing example in the same layer

---

## Absolute Prohibitions (Quick Reference)

| Prohibition                               | Reason                              |
| ----------------------------------------- | ----------------------------------- |
| `any` type                                | Defeats TypeScript safety           |
| `@ts-ignore` / `@ts-expect-error`         | Hides real errors                   |
| Hardcoded strings/numbers                 | Use `businessRules.ts`              |
| Relative cross-boundary imports           | Use `@/` aliases                    |
| Modifying `src/shared/components/ui/`     | shadcn/ui primitives are read-only  |
| Adding dependencies without justification | Increases bundle and attack surface |

---

## Validation Checklist

Before marking any task as done, run:

```bash
npm verify
```

This executes in sequence:

1. `npm lint` — 0 errors, no critical warnings
2. `npm security` — no moderate+ vulnerabilities
3. `npm build` — 0 TypeScript errors, successful build
4. `npm test:run` — all tests pass

**A task is NOT complete until `npm verify` passes.**

---

## Resources

- [businessRules.ts](../../src/shared/constants/businessRules.ts)
- [Project tsconfig](../../tsconfig.app.json)
- [ESLint config](../../eslint.config.js)
