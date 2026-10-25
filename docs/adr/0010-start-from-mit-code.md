# Start from MIT code, restyle it to Kosmos

Kosmos may take components and blocks from MIT-licensed libraries (shadcn/ui, preferring its Base UI variant, and other MIT component and block libraries) and rewrite them in the Kosmos style: our tokens, layered shadows, type roles, motion and density. What Kosmos sells is the style and the finish on top of the code, so building every piece from zero only costs time. This replaces ADR 0004, which required every component to be written fresh and no source to be named.

## Considered options

- **Keep writing everything fresh (ADR 0004).** Rejected: the maintainer judged it too slow for the size of catalogue Kosmos needs before it can sell Pro blocks and templates.

## Consequences

- The `kosmos-style` skill still wins every conflict. Ported code is restyled until it reads as Kosmos, not as its source.
- MIT requires the copyright line to travel with the code. An item built from MIT code lists each source's copyright line in a third-party notice that ships with the registry item, like the Radix Colors notice that ships with the status tints.
- Only MIT (or equally permissive) code is taken. Code with no license, or a license that limits redistribution, stays out.
- Interactive components stay on Base UI (ADR 0001). Code written for other primitives is ported to Base UI.
- Pro blocks and templates still live outside this repo (ADR 0003).
