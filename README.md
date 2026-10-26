# Kosmos UI

Kosmos UI is an open source design system for dashboard app UI. It has components and ready-made blocks built on [Base UI](https://base-ui.com), styled with layered shadows, fast motion, and dense typography. You install them with the shadcn CLI. The code lands in your project as plain files that you own and edit.

```bash
npx shadcn add @kosmos/button
```

This repo holds the components, the blocks, the registry they install from, and the docs site.

## Development

Requirements: Node.js 20.9 or later. `package.json` pins the pnpm version, and Corepack picks it up.

```bash
corepack enable
pnpm install
pnpm dev
```

The dev server runs at http://localhost:3000.

To take the review screenshots with `pnpm screenshots <name>`, first install the Playwright browser once with `pnpm exec playwright install chromium`. [Screenshots and browser checks](CONTRIBUTING.md#screenshots-and-browser-checks) in CONTRIBUTING.md also covers `agent-browser`.

Before you open a pull request, run these three commands:

```bash
pnpm types:check
pnpm lint
pnpm build
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before you open an issue or a pull request. [docs/adr](docs/adr) records the design decisions.

## License

[MIT](LICENSE) © 2026 Thanos Kazakis. The license does not cover the Kosmos UI name or logo.
