# Galicia Version Tracker

A Kanban-based project management tool for tracking versions, stories, and artifacts. Built with React, TypeScript, and Supabase.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18.3 + TypeScript 5.8 |
| Build | Vite 5.4 |
| Styling | Tailwind CSS 3.4 + Radix UI |
| Backend | Supabase (auth + database) |
| Server state | TanStack React Query 5 |
| Forms | React Hook Form 7 + Zod |
| Drag & Drop | dnd-kit |
| Testing | Vitest 4 + Testing Library |
| Linting | ESLint 9 + TypeScript ESLint |
| CI | GitHub Actions |

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project

### Installation

```bash
npm install
```

### Development

```bash
npm run dev       # start dev server at http://localhost:8080
npm run build     # production build
npm run preview   # preview production build
```

### Quality

```bash
npm run verify    # lint + build + tests (full CI check)
npm run lint      # ESLint
npm run test      # Vitest in watch mode
npm run test:run  # Vitest single run
npm run test:coverage  # coverage report
```

## Project Structure

```
src/
├── features/               # Feature-based modules
│   ├── artifacts/          # Artifact management
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types.ts
│   │   └── validations/
│   ├── auth/               # Authentication
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── types.ts
│   ├── kanban/             # Kanban board
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── store/
│   │   └── types.ts
│   ├── stories/            # Story management
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types.ts
│   │   └── validations/
│   └── users/              # User management
│       ├── components/
│       └── hooks/
├── shared/                 # Cross-cutting concerns
│   ├── components/ui/      # Reusable UI primitives
│   ├── constants/          # Routes, tables, query keys, business rules
│   ├── hooks/              # Shared hooks
│   ├── pages/              # Shared pages (NotFound)
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Utility functions
└── infrastructure/         # External service clients
    ├── supabaseClient.ts
    └── queryClient.ts
```

## Architecture

### Feature-based modules

Each feature is self-contained with its own components, hooks, types, and validations. Features only communicate through `src/shared/`.

### Component-hook split

Every component delegates all logic to a dedicated `useXxx` hook. Components are pure presentation; hooks own state, effects, and business logic.

```
KanbanBoard.tsx        → useKanbanBoard.ts
AddStoryDialog.tsx     → useAddStoryDialog.ts
AddArtifactDialog.tsx  → useAddArtifactDialog.ts
```

### Path aliases

All imports use the `@/` alias — no relative `../../` paths.

```ts
import { ROUTES } from "@/shared/constants/routes";
import { useStories } from "@/features/stories/hooks/use-stories";
```

### Code splitting

The production bundle is split into vendor chunks for optimal caching:

- `vendor-react` — React, React DOM, React Router
- `vendor-query` — TanStack React Query
- `vendor-supabase` — Supabase JS
- `vendor-dnd` — dnd-kit
- `vendor-ui` — Lucide, CVA, clsx, tailwind-merge

## CI

Every pull request runs `npm run verify` via GitHub Actions:

```
lint → build → tests
```

The workflow is defined in [.github/workflows/ci.yml](.github/workflows/ci.yml).

## AI Agent Skills

This project includes [Agent Skills](https://agentskills.io) to guide AI coding assistants. Skills live in `skills/` and are auto-loaded by Claude Code.

| Skill | Purpose |
|-------|---------|
| `react` | Component patterns, hooks, separation of concerns |
| `typescript` | Strict type patterns |
| `code-standards` | Constants, imports, file placement |
| `component-hook-split` | Every component delegates logic to a hook |
| `commit` | Conventional Commits format |
| `pr` | Pull request creation with gh CLI |
| `jest` | Vitest + Testing Library patterns |
