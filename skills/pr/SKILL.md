---
name: pr
description: >
  Creates well-documented pull requests with comprehensive descriptions using gh CLI.
  Trigger: When the user explicitly requests /pr, "create a pull request", or "open a PR".
license: Apache-2.0
metadata:
  author: Galicia Version Tracker
  version: "1.0"
  scope: [root]
  auto_invoke: "Creating a pull request"
allowed-tools: Read, Bash, Glob, Grep
---

## When to Use

Use this skill **only** when the user explicitly requests:

- `/pr`
- "Create a pull request"
- "Open a PR"
- "Make a PR"

**🔴 NEVER create PRs automatically** — even if a task is complete. Wait for an explicit request.

---

## Pre-PR Checklist (MANDATORY)

Before opening a PR, `npm run verify` must pass:

```bash
npm run verify
```

**Do not open a PR if `npm run verify` fails.**

---

## Requirements

- GitHub CLI (`gh`) installed and authenticated
- On a feature branch — **never open a PR from `main`**

---

## Process (Step by Step)

Run these commands **in parallel** to gather context:

```bash
git log main..HEAD --oneline          # commits since branching from main
git diff main...HEAD --stat           # files changed
git branch --show-current             # current branch name
```

Then:

1. Analyze commits to determine scope and nature of changes
2. Detect UI changes (look for `.tsx` / `.css` / Tailwind diffs) → add Screenshots section
3. Draft PR title following Conventional Commits format (same rules as commit messages)
4. Fill in the PR template below
5. Create PR via `gh pr create`

---

## PR Title Format

Same convention as commit messages: `<type>[scope]: <description>`

```
feat(artifacts): add drag-and-drop reordering
fix(auth): handle expired session redirect
chore(ci): add GitHub Actions verify workflow
```

---

## PR Template

```markdown
## Summary
Brief description of what this PR does and why.

## Changes
- Specific change 1
- Specific change 2
- Specific change 3

## Testing
Steps to verify the changes work correctly:
1. Step one
2. Step two

## Screenshots
(include if there are UI changes — otherwise remove this section)

## Checklist
- [ ] Tests pass (`npm run verify`)
- [ ] No breaking changes
- [ ] Documentation updated (if applicable)
```

---

## Commands

```bash
# Create PR (non-interactive)
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
...

## Changes
- ...

## Testing
...

## Checklist
- [ ] Tests pass (`npm run verify`)
- [ ] No breaking changes
EOF
)"

# Open PR in browser after creation
gh pr view --web
```

---

## Absolute Prohibitions

| Prohibition                     | Reason                               |
| ------------------------------- | ------------------------------------ |
| Opening PR from `main`          | Destructive — never allowed          |
| Auto-creating PR without request | User controls PR lifecycle          |
| `Co-Authored-By` in PR body     | User explicitly does not want this   |
| Skipping `npm run verify`       | CI will fail, wasted review cycle    |
| Force-pushing after PR is open  | Destructive to reviewer context      |
