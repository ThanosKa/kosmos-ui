# Kosmos UI

Kosmos UI is an open source (MIT) design system for dashboard app UI: components and blocks built on Base UI, distributed as a shadcn registry (`@kosmos`), with a Fumadocs docs site.
This repo is one Next.js app that holds the landing page, the docs, the preview routes and the registry.

## Where things live

- **Style**: load the `kosmos-style` skill before you write or change any component or block. It is the single source of truth for values and rules and wins every conflict with a review skill.
- **Terms**: `GLOSSARY.md`. Use its terms and avoid the ones it lists under _Avoid_.
- **Why**: `docs/adr/`. Read the relevant ADR before reversing a decision; record new hard-to-reverse decisions there.

## Git

- Commits: `type(scope): description`, one line, imperative, no body, no footer, no `Co-Authored-By`.
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`. Scope is the component or area (`button`, `docs`, `registry`).
- Trunk-based: short-lived `feature/`, `fix/`, `refactor/`, `docs/` branches, PR straight into `main`. There is no `dev` branch.
- PRs: `gh pr create`, fill in `.github/pull_request_template.md`. Squash merge only; the PR title becomes the commit on `main`, so write it in commit format.

## Gotchas

- `style` means code formatting only. A visual change to a component is `feat` or `fix`.
- The style comes from patterns studied in existing products. Write every component fresh on Base UI and name no product or company as a source in tracked files (ADR 0004).
- Pro blocks and templates never enter this repo (ADR 0003).
