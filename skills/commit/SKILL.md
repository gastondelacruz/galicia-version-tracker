---
name: commit
description: >
  Commit conventions and pull request guidelines for Galicia Version Tracker.
  Trigger: When the user explicitly requests a commit or PR.
license: Apache-2.0
metadata:
  author: Galicia Version Tracker
  version: "1.0"
  scope: [root]
  auto_invoke: "User explicitly requests creating a commit or pull request"
allowed-tools: Read, Bash, Glob, Grep
---

## When to Use

Use this skill **only** when the user explicitly requests:

- "Create a commit"
- "Commit these changes"
- "Make a commit with..."
- "Commit the work"
- "commit" (as a standalone command)

**🔴 NEVER create commits automatically** — even if a task is complete. Wait for an explicit request.

---

## Pre-Commit Checklist (MANDATORY)

Before committing, `npm run verify` must pass:

```bash
npm run verify
```

This runs in sequence:

1. `npm run lint` — 0 errors, no critical warnings
2. `npm run security` — no moderate+ vulnerabilities
3. `npm run build` — 0 TypeScript errors, successful build
4. `npm run test:run` — all tests pass

**Do not commit if `npm run verify` fails.**

---

## Commit Message Format

Follow **Conventional Commits**: `<type>[scope]: <description>`

```
<type>[optional scope]: <short description>

[optional body — bullet points if needed]
```

### Types

| Type       | When to Use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature or capability                               |
| `fix`      | Bug fix                                                 |
| `refactor` | Code change that neither adds a feature nor fixes a bug |
| `test`     | Adding or updating tests                                |
| `docs`     | Documentation only                                      |
| `style`    | Formatting, whitespace (no logic change)                |
| `chore`    | Build process, tooling, dependencies                    |
| `perf`     | Performance improvement                                 |

### Rules

- **Lowercase** description — no capital letter after the colon
- **Imperative mood** — "add feature", not "added feature"
- **No period** at the end
- **No `Co-Authored-By`** lines — never include them
- Keep description under **72 characters**
- Use body only when the *why* is not obvious from the title

### Examples

```
feat(search): add product filtering by price range
fix(compare): handle null values in price display
test(components): add behavior tests for ProductCard
refactor(hooks): simplify useProductData hook
chore: configure Vitest for component testing
```

---

## Commit Process (Step by Step)

Run these three commands **in parallel** before writing the message:

```bash
git status            # see untracked / modified files
git diff --staged     # review what's staged
git log --oneline -5  # match existing commit style
```

Then:

1. Stage only relevant files — **never** `git add -A` or `git add .`
2. Draft the commit message following the format above
3. Create the commit — **no `--no-verify`**, never skip hooks

---

## Scopes (Reference)

Use the feature or layer name as scope when relevant:

| Scope        | Examples                                  |
| ------------ | ----------------------------------------- |
| `auth`       | Login, session, protected routes          |
| `search`     | Product search feature                    |
| `compare`    | Price comparison feature                  |
| `hooks`      | Shared or feature hooks                   |
| `components` | Shared or feature UI components           |
| `config`     | Vite, TypeScript, ESLint, Vitest configs  |
| `deps`       | Dependency additions or upgrades          |

Omit scope when the change is truly cross-cutting.

---

## Pull Request Guidelines

Before opening a PR:

1. Run `npm run verify` — all checks must pass
2. Ensure all commits in the branch follow the convention above
3. PR title follows the same format as a commit message
4. Link related issues in the PR body

---

## Absolute Prohibitions

| Prohibition                        | Reason                                  |
| ---------------------------------- | --------------------------------------- |
| Auto-committing without request    | User controls commit history            |
| `Co-Authored-By` in commit message | User explicitly does not want this      |
| `--no-verify` flag                 | Never bypass hooks                      |
| `git add -A` / `git add .`         | May include secrets or unrelated files  |
| Amending published commits         | Destructive to shared history           |
| Force-pushing to `main`            | Never allowed                           |
