# Contributing to Kosmos UI

Thanks for helping out. Kosmos UI has a single maintainer, who decides what gets merged, so for anything bigger than a small fix, open an issue first to agree on the approach.

## Setup

```bash
corepack enable
pnpm install
pnpm dev
```

Use pnpm only; the version is pinned in `package.json`.

### Screenshots and browser checks

Each component and block is reviewed in four screenshots and in a real browser. On a new machine, install both browsers once:

```bash
pnpm exec playwright install chromium   # the browser `pnpm screenshots` drives
npm install -g agent-browser            # or: brew install agent-browser
agent-browser install                   # downloads the browser agent-browser drives
```

Then, with `pnpm dev` running, `pnpm screenshots <name> --port 3000` writes four PNGs to `.screenshots/`.

### Site checks

`pnpm docs:check --port 3000` opens the docs and the landing page in a browser, with `pnpm dev` running, and asserts what a visitor sees: header tabs, sidebars, the block viewer, the landing sections, search and the Markdown pages. Run it after you change the docs shell or the landing page.

Before a release, crawl the production build for broken links:

```bash
pnpm build && pnpm start --port 3000
pnpm links:check --port 3000              # every internal link, image and #anchor, from / and the sitemap
pnpm links:check --port 3000 --external   # also requests every outside link once
```

It also fails on a page error, an indexable page without a title, description and social image, and a missing page that does not answer 404.

### Index thumbnails

The cards on `/docs/components` and `/docs/blocks` show a light and a dark thumbnail of each item, committed in `public/thumbs/`. Shoot them again when you add a component or block, or when its demo changes how it looks:

```bash
pnpm thumbnails --port 3000                # every component and block
pnpm thumbnails button badge --port 3000   # only these, by registry name
```

It needs `pnpm dev` running; `--port` is the dev server's port (3000 by default). Each thumbnail is the preview the item's docs page opens with (its first `<ComponentPreview>`, usually `<name>-demo`), saved as `public/thumbs/<name>-light.png` and `<name>-dark.png`. A demo renders an overlay closed, so an overlay (a dialog, menu, select or tooltip) gets its own `<name>-thumb.tsx` in `registry/kosmos/examples/` with the overlay pinned open in a `ThumbStage`, and the thumbnail shoots that file instead.

### Install smoke test

`pnpm registry:smoke` installs the whole registry the way `content/docs/installation.mdx` tells users to, then checks that it builds. Run it after you change a `*.registry.json`, a dependency, or the installation page.

1. It builds the registry and serves `public/r` on port 3103 (`--port <n>`, or `--port 0` for a free one).
2. It checks each item's imports against its own `dependencies` and `registryDependencies`.
3. It creates a new app in a temp folder with `npx shadcn@latest init -t next -b base` (preset `nova`, or `--preset <name>`), adds the `@kosmos` registry and `@kosmos/tokens`, then every other item in one `shadcn add`.
4. It writes `/kosmos-smoke` with every item's docs preview, plus one page per item, then runs the app's `npm run typecheck` and `npm run build`.

It prints install, dependencies, types and build per item, exits 1 if any fail, and keeps the app and logs in the temp folder it prints. It needs network access for npm. To check a single item in a clean app, use `pnpm registry:check <name>`.

### Claude Code

The repo ships its Claude Code setup, so a fresh clone works on any machine:

- **Project skills** (`better-*`, `review-animations`) are committed in `.claude/skills/` and load automatically. `skills-lock.json` records where each one came from. Update them with `npx skills update -p`, or restore them from the lockfile with `npx skills experimental_install`.
- **`code-review`** comes from the `mattpocock-skills` plugin. `.claude/settings.json` registers its marketplace and enables it, so Claude Code offers to install it the first time you trust the folder. To install it by hand: `/plugin marketplace add mattpocock/skills`, then `/plugin install mattpocock-skills@mattpocock`.

## Commits and branches

- Commit messages: `type(scope): description`, one line, imperative mood, no body.
- Types: `feat`, `fix`, `refactor`, `style` (code formatting only), `docs`, `test`, `chore`. The scope is the component or area, e.g. `feat(button): add loading state`.
- A visual change to a component is `feat` or `fix`, never `style`.
- Branch from `dev` with a `feature/`, `fix/`, `refactor/` or `docs/` prefix and open the PR against `dev`. `main` holds what is released; the maintainer merges `dev` into it.

## Pull requests

Every PR is squash merged, and its title becomes the commit on `dev`, so write the title in the commit format above. The maintainer expects:

- One focused change per PR.
- The PR template filled in, including four screenshots of any visual change (light and dark, mobile and desktop).
- `pnpm types:check`, `pnpm lint` and `pnpm build` passing.
- The docs page updated when a component's API or behavior changes, plus a changelog entry for public changes.
- Code written from scratch. Do not paste code from projects whose license does not allow it.

## License

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE). There is no CLA to sign.
