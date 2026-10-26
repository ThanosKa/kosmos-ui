# Open core: MIT repo, Pro outside it

The whole repo (components, blocks, docs, landing page) is public under plain MIT, `Copyright (c) 2026 Thanos Kazakis`. Paid Pro blocks and templates live in a separate private codebase with their own license and never enter this repo. Component libraries that also sell a paid tier commonly work this way. The free part grows adoption, and the paid part stays closed.

## Considered Options

- **Apache-2.0, MIT with extra "fair use" terms, AGPL**: each adds friction for users that a UI kit does not need. Plain MIT is what the ecosystem uses.
- **Pro code in this repo behind a flag**: anyone could read it, so it would not be sellable.

## Consequences

- The maintainer accepts contributions under MIT with no CLA, so the maintainer may reuse them anywhere, including in Pro.
- The "Kosmos UI" name and logo are not covered by the license.

## Free and Pro per block category

Each block category has at least one free variant, a registry item in this repo (`"meta": { "tier": "free" }`). Pro variants of the same category sit beside it on the category page. A visitor compares them in one place, and the free one is always first. The Pro code lives in the private `kosmos-pro` repo, its own Next.js app. That app installs the free components from the public `@kosmos` registry with the shadcn CLI, as any user does, and commits them. It never forks the free code, and it proves the registry works for a real app. Its Pro blocks name the `@kosmos/*` components they need in `registryDependencies`. A buyer installs them on top of the free registry.

This repo knows only what the docs show of a Pro variant: its name, title, description, block category, and the path of its preview. These live in `proVariants` in `lib/registry.ts`. It never holds its code, not even built registry JSON.

## Pro previews in iframes

The docs render a Pro variant live from the Pro deployment. It sits inside the same block viewer as a free one, with a Pro badge and its Code tab locked. The docs site reads the deployment's origin from `NEXT_PUBLIC_KOSMOS_PRO_URL`. Without it, the site shows no Pro variant anywhere and its counts drop to the free variants. Nothing else changes, so forks, previews, and local development need no Pro access.

- **Why an iframe on another origin**: it is the only way to show the real block running. Its code stays out of this repo and out of the docs bundle. A screenshot would hide the states and the widths. Shipping compiled Pro code in the docs bundle would expose it.
- **The theme travels in the address** (`?theme=light|dark`): the docs keep their theme in their own origin's storage, which a frame on another origin cannot read. A theme change reloads the frame.
- **The height travels by message**: the docs cannot measure a frame on another origin, so the Pro preview posts `kosmos:preview-height` to its parent. The frame accepts that message only from its own window.
- **Only the docs may frame the Pro previews**: the Pro app sends `Content-Security-Policy: frame-ancestors` with the docs origin (`KOSMOS_SITE_URL` there), and `X-Robots-Tag: noindex` on every page.

## No store yet

Until a store exists, the locked Code tab says the variant comes with Kosmos Pro and points to Preview. It promises no timing and has no link. A "Get Pro" link to a page that does not exist, or to the private repo, would lead nowhere. `proUrl` in `lib/shared.ts` stays unset until the store launches. Setting it brings the link back.
