# Contributing to Kosmos UI

Thanks for helping out. Kosmos UI has a single maintainer, who decides what gets merged, so for anything bigger than a small fix, open an issue first to agree on the approach.

## Setup

```bash
corepack enable
pnpm install
pnpm dev
```

Use pnpm only; the version is pinned in `package.json`.

### Claude Code

The repo ships its Claude Code setup, so a fresh clone works on any machine:

- **Project skills** (`better-*`, `review-animations`) are committed in `.claude/skills/` and load automatically. `skills-lock.json` records where each one came from. Update them with `npx skills update -p`, or restore them from the lockfile with `npx skills experimental_install`.
- **`code-review`** comes from the `mattpocock-skills` plugin. `.claude/settings.json` registers its marketplace and enables it, so Claude Code offers to install it the first time you trust the folder. To install it by hand: `/plugin marketplace add mattpocock/skills`, then `/plugin install mattpocock-skills@mattpocock`.

## Commits and branches

- Commit messages: `type(scope): description`, one line, imperative mood, no body.
- Types: `feat`, `fix`, `refactor`, `style` (code formatting only), `docs`, `test`, `chore`. The scope is the component or area, e.g. `feat(button): add loading state`.
- A visual change to a component is `feat` or `fix`, never `style`.
- Branch from `main` with a `feature/`, `fix/`, `refactor/` or `docs/` prefix and open the PR against `main`.

## Pull requests

Every PR is squash merged, and its title becomes the commit on `main`, so write the title in the commit format above. The maintainer expects:

- One focused change per PR.
- The PR template filled in, including four screenshots of any visual change (light and dark, mobile and desktop).
- `pnpm types:check`, `pnpm lint` and `pnpm build` passing.
- The docs page updated when a component's API or behavior changes, plus a changelog entry for public changes.
- Code written from scratch. Do not paste code from projects whose license does not allow it.

## License

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE). There is no CLA to sign.
