# Kosmos UI

Kosmos UI is an open source design system for dashboard app UI: components and ready-made blocks built on [Base UI](https://base-ui.com), styled with layered shadows, quick motion and dense typography. You install them with the shadcn CLI, and the code lands in your project for you to own and edit.

```bash
npx shadcn add @kosmos/button
```

This repo holds everything: the components, the blocks, the registry they are installed from, and the docs site.

## Development

Requirements: Node.js 20.9 or later. The pnpm version is pinned in `package.json`, and Corepack picks it up.

```bash
corepack enable
pnpm install
pnpm dev
```

Then open http://localhost:3000.

To take the review screenshots (`pnpm screenshots <name>`), install Playwright's browser once with `pnpm exec playwright install chromium`. [CONTRIBUTING.md](CONTRIBUTING.md#screenshots-and-browser-checks) also covers `agent-browser`.

Before you open a pull request:

```bash
pnpm types:check
pnpm lint
pnpm build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Design decisions are recorded in [docs/adr](docs/adr).

## License

[MIT](LICENSE) © 2026 Thanos Kazakis. The license does not cover the Kosmos UI name or logo.
