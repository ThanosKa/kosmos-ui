# Contributing to Kosmos UI

Kosmos UI has a single maintainer, who decides what gets merged. For anything bigger than a small fix, open an issue first to agree on the approach.

## Setup

```bash
corepack enable
pnpm install
pnpm dev
```

Use pnpm only. `package.json` pins the version.

### Screenshots and browser checks

Each component and block is reviewed in four screenshots and in a real browser. On a new machine, install both browsers once. The comments below say what each command does:

```bash
pnpm exec playwright install chromium   # the browser `pnpm screenshots` drives
npm install -g agent-browser            # or run: brew install agent-browser
agent-browser install                   # downloads the browser agent-browser drives
```

With `pnpm dev` running, `pnpm screenshots <name> --port 3000` writes four PNGs to `.screenshots/`.

### Site checks

With `pnpm dev` running, `pnpm docs:check --port 3000` opens the docs, the landing page and the Presets page in a browser and asserts what a visitor sees: header tabs, sidebars, the block viewer, the landing sections, the preset previews, search and the Markdown pages. Run it after you change the docs shell, the landing page or the Presets page.

The command reads `NEXT_PUBLIC_KOSMOS_PRO_URL` like the dev server does. If the variable is unset, the command asserts that no Pro variant shows. If it is set to a running Pro deployment, which only the maintainer has, the command asserts that each Pro variant shows live on its category page. Give the dev server and the command the same value.

Three of its checks guard against bugs that only show in a browser. Run them against a production build (`pnpm build && pnpm start`), since a dev server compiles each page on first visit and times out:

- The focus-clip check guards the focus ring: on every `/view` route, tabbing, opening popups and clicking fields never leaves a ring cut off by an ancestor with `overflow`. Give the clipping container room, such as padding, or `scroll-p-1` on a scroller. `node scripts/focus-clip.mts --port 3000 --filter <name> --theme dark --width 375` runs it alone.
- The sideways-scroll check guards the phone layout: no docs page is wider than a 375px screen.
- The console check guards the page's health: no docs page logs a console error or warning. React's development warnings only show on a dev server, so also open a page you changed there.

`pnpm lint` guards the tokens: registry code has no color literal (hex, `rgb()`, `oklch()`) and no Tailwind palette class (`text-orange-500`), so every color comes from a token. The token files are the only place a color value is written.

Before a release, crawl the production build for broken links:

```bash
pnpm build && pnpm start --port 3000
pnpm links:check --port 3000              # every internal link, image and #anchor, from / and the sitemap
pnpm links:check --port 3000 --external   # also requests every outside link once
```

The crawl also fails on a page error, on an indexable page that lacks a title, a description, or a social image, and on a missing page that does not answer 404.

### Index thumbnails

The cards on `/docs/components` and `/docs/blocks` show a light and a dark thumbnail of each item. The thumbnails are committed in `public/thumbs/`. Shoot them again when you add a component or block, or when its demo changes how it looks:

```bash
pnpm thumbnails --port 3000                # every component and block
pnpm thumbnails button badge --port 3000   # only these, by registry name
```

The command needs `pnpm dev` running. `--port` is the dev server's port, 3000 by default. Each thumbnail is the first `<ComponentPreview>` on the item's docs page, usually `<name>-demo`, saved as `public/thumbs/<name>-light.png` and `public/thumbs/<name>-dark.png`.

A demo renders an overlay closed. An overlay, such as a dialog, menu, select, or tooltip, therefore gets its own `<name>-thumb.tsx` in `registry/kosmos/examples/`, with the overlay pinned open in a `ThumbStage`. The thumbnail shoots that file instead.

### Install smoke test

`pnpm registry:smoke` installs the whole registry the way `content/docs/installation.mdx` tells users to, then checks that the result builds. Run it after you change a `*.registry.json` file, a dependency, or the installation page.

1. It builds the registry and serves `public/r` on port 3103 (`--port <n>`, or `--port 0` for a free one).
2. It checks each item's imports against its own `dependencies` and `registryDependencies`.
3. It creates a new app in a temp folder with `npx shadcn@latest init -t next -b base` (preset `nova`, or `--preset <name>`), adds the `@kosmos` registry and `@kosmos/tokens`, then every other item in one `shadcn add`.
4. It writes `/kosmos-smoke` with every item's docs preview, plus one page per item, then runs the app's `npm run typecheck` and `npm run build`.

The command prints the install, dependencies, types, and build results per item and exits 1 if any fail. On failure, or with `--keep`, it keeps the app and the logs in the temp folder it prints. On success it deletes them. It needs network access for npm. To check a single item in a clean app, use `pnpm registry:check <name>`.

### Claude Code

The repo ships its Claude Code setup, so a fresh clone works on any machine.

- **Project skills** (`better-*`, `review-animations`) are committed in `.claude/skills/` and load automatically. `skills-lock.json` records where each one came from. Update them with `npx skills update -p`, or restore them from the lockfile with `npx skills experimental_install`. An update brings back `disable-model-invocation: true` in `review-animations`. Delete that line again, because `build-component` calls the skill itself.
- **`code-review`** comes from the `mattpocock-skills` plugin. `.claude/settings.json` registers its marketplace and enables it, so Claude Code offers to install it the first time you trust the folder. To install it by hand, run `/plugin marketplace add mattpocock/skills`, then `/plugin install mattpocock-skills@mattpocock`.

## Commits and branches

- Commit messages: `type(scope): description`, one line, imperative mood, no body.
- Types: `feat`, `fix`, `refactor`, `style` (code formatting only), `docs`, `test`, `chore`. The scope is the component or area, such as `feat(button): add loading state`.
- A visual change to a component is `feat` or `fix`, never `style`.
- Branch from `dev` with a `feature/`, `fix/`, `refactor/` or `docs/` prefix and open the PR against `dev`. `main` holds what is released. The maintainer merges `dev` into it.

## Pull requests

Every PR is squash merged, and its title becomes the commit on `dev`, so write the title in the commit format above. The maintainer expects each PR to have:

- One focused change.
- Four screenshots of any visual change in the PR description: light and dark, on mobile and on desktop.
- Passing `pnpm types:check`, `pnpm lint`, and `pnpm build`.
- An updated docs page when a component's API or behavior changes, and a changelog entry for any public change.
- Code written from scratch. Do not paste code from a project whose license does not allow it.

## License

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE). There is no CLA to sign.
