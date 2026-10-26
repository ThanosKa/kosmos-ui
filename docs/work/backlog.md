# Backlog: checks after the black and white release

Status: open
Date: 2026-10-25

Things the maintainer wants checked or built next. Each becomes a ticket in `docs/work/tickets/` when it is picked up.

## Checks

- [ ] **Retro on the black and white run.** What cost the most tokens and time (full review cycles on every ticket, Opus everywhere, usage limits, merges, disk), what to keep, and how the next spec should run (model, review depth, concurrency).
- [ ] **Rules that check agents' work.** Use the `writing-for-agents` skill to tighten AGENTS.md and the skills, and turn the rules agents broke this run into lint or test checks so they fail automatically: tokens only (no raw colours), the brand colour never in registry items, a third-party notice on ported items, no key-like demo strings, no blurred sticky headers, the docs-check assertions kept in sync.
- [ ] **Act on the design review.** `docs/work/design-review.md` ranks the findings of the system design review (the `useControlled` dedupe is done). Pick which to do.
- [ ] **Open decisions.** Go through the decisions collected during the run (`.scratch/decisions-black-and-white.md`) and settle each one.
- [ ] **Decisions from the backlog checks (PR #36).** The Settings confirm dialog leaves focus behind the modal (`initialFocus={false}`): intended or a bug? The docs now use US spelling: move the skills, the ADRs and `GLOSSARY.md` ("Brand colour") to it too? The Members table hides the avatar on narrow cards instead of scrolling sideways: keep it? Showcase screens use `overflow-y-auto`, since `ScrollArea` breaks their full height: change `ScrollArea` or keep the exception?

## Build

- [ ] **Richer showcase.** The landing's Dashboard tab shows more than cards: the data table in full, with faceted filters, the bulk bar and the column menu working, in the dense pro-tool look.
- [ ] **Empty states.** More empty-state variants (first use, no results, cleared filters, error, no permission) as components or blocks, and use them in the tables, lists and charts that have none yet.
- [ ] **More navbar options.** Navbar variants: a mega menu with grouped links and descriptions, a centred-links layout, a search slot, and a banner above it.
- [ ] **Example dashboards.** Full dashboards built only from Kosmos blocks, so visitors and the maintainer can judge the style across a whole app: a CRM (contacts, deals pipeline, activity), an analytics dashboard (traffic, funnels, sources), and one more common kind (e.g. billing and usage, or an admin panel). Each also checks the current app for gaps in components and blocks. Pick which stay free and which become Pro templates (ADR 0003).
- [ ] **Logo marquee, brand on hover.** Logos sit grey and turn to their own brand colours on hover or focus, as in the reference marquee at https://www.affectui.com/blocks/logo-marquee (MIT, ADR 0010).
- [ ] **Pricing variants.** More pricing layouts next to the current block, studied from the reference's pricing page.
- [ ] **Motion pieces.** A nicer text reveal (https://www.affectui.com/motion/text-reveal) to replace or sit beside the current one, a shimmer loader (https://www.affectui.com/motion/shimmer-loader), and the rest of the reference's motion set.
- [ ] **AI product components.** Thinking loader, tool call card, message actions, change summary and the like from the reference, merged with what Kosmos already has (tool-call, tool-approval, run-timeline, prompt composer) into one coherent set, plus new blocks built from them.
- [ ] **A proper landing page.** The current landing reads as generic. Before building again: study the strongest component-library landings, decide what Kosmos's page must say and show (message, hero, showcase, proof, pricing, path to install), prototype two or three directions, pick one with the maintainer, then build it from blocks. One direction to prototype: follow the reference landing (https://www.affectui.com) closely, section by section, with its kind of motion (animated illustrations in sections, text reveal, shimmer, marquee with brand on hover). Its site source is not public, only its MIT components (github.com/flohoeller/affectui), so the page is rebuilt from those components and Kosmos blocks, restyled. Research notes and screenshots: `.scratch/research/landings/affectui.md`.
- [ ] **A better bento.** The bento block reads weak. Rebuild it from the Magic UI bento grid (https://magicui.design/docs/components/bento-grid, MIT, ADR 0010), restyled, with live components in the tiles.
- [ ] **Go live.** When the above is in: release `dev` to `main` (maintainer's PR with a merge commit) and deploy.
- [ ] **MIT catalogue, wave A.** Port the first wave from the MIT catalogue (mockup and screenshot, device frames, marquee primitive, avatar circles, glow and section wrapper, card, spinner, progress, alert dialog and sheet, login and signup blocks).

## Later

Not started until the maintainer decides to go live.

- [ ] **Pro in a private repo.** Each block category keeps one free variant here and gets at least one Pro variant in the private repo, shown live on the site with locked code (ADR 0003).
- [ ] **Templates.** Whole apps built from blocks: SaaS analytics admin, AI assistant workspace, project management, agent ops console, a marketing site in the dashboard style.
- [ ] **Packaging.** Prices, licence, a private registry with a licence key, and payments.
