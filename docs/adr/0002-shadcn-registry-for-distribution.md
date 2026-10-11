# Distribute through a shadcn registry, not npm or our own CLI

Users install components with `npx shadcn add @kosmos/<name>`, which copies the source into their project. We publish no npm package and ship no CLI of our own. Copy-in source is what users of shadcn-style libraries expect, lets them edit every component, and needs no release pipeline: the registry updates with each deploy of `main`.

## Considered Options

- **npm package**: versioned and familiar, but users cannot edit the code, and every change needs a release.
- **Our own CLI** (as some commercial kits ship): more brand control, but a second tool to build and maintain. If we need it later, it can sit on top of the same registry.

## Consequences

- The repo stays a single Next.js app; a monorepo only becomes worth it if we build our own CLI.
- Every registry item must declare its dependencies, registry dependencies and CSS variables, because nothing else installs them.
