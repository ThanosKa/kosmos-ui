# Open core: MIT repo, Pro outside it

The whole repo (components, blocks, docs, landing page) is public under plain MIT, `Copyright (c) 2026 Thanos Kazakis`. Paid Pro blocks and templates live in a separate private codebase with their own license and never enter this repo. This is the common model for component libraries that also sell a paid tier: the free part grows adoption, the paid part stays closed.

## Considered Options

- **Apache-2.0, MIT with extra "fair use" terms, AGPL**: each adds friction for users that a UI kit does not need. Plain MIT is what the ecosystem uses.
- **Pro code in this repo behind a flag**: anyone could read it, so it would not be sellable.

## Consequences

- Contributions are accepted under MIT with no CLA, so the maintainer may reuse them anywhere, including in Pro.
- The "Kosmos UI" name and logo are not covered by the license.
