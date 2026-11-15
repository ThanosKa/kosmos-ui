# Start from MIT code, restyle it to Kosmos

Kosmos may take components and blocks from MIT-licensed libraries and rewrite them in the Kosmos style. The libraries are shadcn/ui, preferring its Base UI variant, and other MIT component and block libraries. The Kosmos style means our tokens, layered shadows, type roles, motion, and density. What Kosmos sells is the style and the finish on top of the code, so building every piece from zero only costs time. This replaces ADR 0004, which required us to write every component fresh and to name no source.

## Considered options

- **Keep writing everything fresh (ADR 0004).** Rejected: the maintainer judged it too slow for the size of catalog Kosmos needs before it can sell Pro blocks and templates.

## Consequences

- The `kosmos-style` skill still wins every conflict. We restyle ported code until it reads as Kosmos, not as its source.
- MIT requires the copyright line to travel with the code. An item built from MIT code lists each source's copyright line in a third-party notice that ships with the registry item. The Radix Colors notice that ships with the status tints works the same way.
- We take only MIT (or equally permissive) code. Code with no license, or a license that limits redistribution, stays out.
- Interactive components stay on Base UI (ADR 0001). We port code written for other primitives to Base UI.
- Pro blocks and templates still live outside this repo (ADR 0003).
