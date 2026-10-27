# Contributing to Kosmos UI

Kosmos UI has a single maintainer, who decides what gets merged. For anything bigger than a small fix, open an issue first to agree on the approach.

## Setup

```bash
corepack enable
pnpm install
pnpm dev
```

Use pnpm only. `package.json` pins the version.

### Screenshots

You review each component and block in four screenshots. On a new machine, install both browsers once. The comments below say what each command does:

```bash
pnpm exec playwright install chromium   # the browser `pnpm screenshots` drives
npm install -g agent-browser            # or run: brew install agent-browser
agent-browser install                   # downloads the browser agent-browser drives
```

With `pnpm dev` running, `pnpm screenshots <name> --port 3000` writes four PNGs to `.screenshots/`.

### Checks

GitHub Actions runs `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm build` on every pull request to `dev` and `main`. Run them locally before you push. The browser checks (the docs, focus-ring, console and link sweeps) are gone: check the pages you changed by hand on `pnpm dev`, and open the docs at 375px wide.

`pnpm lint` guards the tokens: registry code has no color literal (hex, `rgb()`, `oklch()`) and no Tailwind palette class (`text-orange-500`), so every color comes from a token. The token files are the only place a color value is written.
