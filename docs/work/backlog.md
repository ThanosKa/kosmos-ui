# Backlog: checks after the black and white release

Status: open
Date: 2026-10-25

Things the maintainer wants checked or built next. Each becomes a ticket in `docs/work/tickets/` when it is picked up.

## Checks

- [ ] **Docs writing.** Review the landing page and the docs pages with the pstack technical-writing skill (https://github.com/cursor/plugins/blob/main/pstack/skills/technical-writing/SKILL.md) and fix what it finds.
- [ ] **Presets are downloadable.** Every preset a visitor picks can be taken away: the DESIGN.md downloads as a file, the CSS copies for light and dark, and the `preset-<id>` registry item installs with the shadcn CLI in a clean app.
- [ ] **Branch-wide code review.** The code review at the end of the black and white spec was skipped. Run it over the release and fix the findings.
- [ ] **Light reviews to finish.** Items that skipped the full `build-component` review (better-interface, break-ui, mobile-native): landing (15 and its revision), stat and chart cards (18), combobox and tags input (22), settings (25), members and invites (26). Also check the calendar (24) in the browser after its last fixes.
- [ ] **Hero copy logic.** The Hero block still has its own copy hook; move it onto `use-copy`.
- [ ] **Motion across the app.** Review every animation on the site and in the components (entrances, blur fades, marquee, flickering grid, menus, dialogs) with `review-animations`, in light and dark and under reduced motion.
- [ ] **Get code looks like code.** The Presets page's "Get code" dialog shows the CSS, the registry command and the DESIGN.md as plain black and white text. Show them syntax-highlighted, like an editor, with the docs' code-block highlighting in light and dark.
- [ ] **Presets page flicker.** On the Presets page, the preset tab flickers when you click things. Find the cause (likely the preset being reapplied to the document or the preview iframe on each change) and fix it.
- [ ] **Retro on the black and white run.** What cost the most tokens and time (full review cycles on every ticket, Opus everywhere, usage limits, merges, disk), what to keep, and how the next spec should run (model, review depth, concurrency).
- [ ] **Rules that check agents' work.** Use the `writing-for-agents` skill to tighten AGENTS.md and the skills, and turn the rules agents broke this run into lint or test checks so they fail automatically: tokens only (no raw colours), the brand colour never in registry items, a third-party notice on ported items, no key-like demo strings, no blurred sticky headers, the docs-check assertions kept in sync.
- [ ] **System design review.** Review the architecture with the `codebase-design` skill: the presets module, the registry build and checks, the preview and docs pipeline, and the shared lib items (e.g. `useControlled` is copied in three blocks).
- [ ] **Open decisions.** Go through the decisions collected during the run (`.scratch/decisions-black-and-white.md`) and settle each one.

## Build

- [ ] **Richer showcase.** The landing's Dashboard tab shows more than cards: the data table in full, with faceted filters, the bulk bar and the column menu working, in the dense pro-tool look.
- [ ] **Empty states.** More empty-state variants (first use, no results, cleared filters, error, no permission) as components or blocks, and use them in the tables, lists and charts that have none yet.
- [ ] **More navbar options.** Navbar variants: a mega menu with grouped links and descriptions, a centred-links layout, a search slot, and a banner above it.
- [ ] **Example dashboards.** Full dashboards built only from Kosmos blocks, so visitors and the maintainer can judge the style across a whole app: a CRM (contacts, deals pipeline, activity), an analytics dashboard (traffic, funnels, sources), and one more common kind (e.g. billing and usage, or an admin panel). Each also checks the current app for gaps in components and blocks. Pick which stay free and which become Pro templates (ADR 0003).
- [ ] **Logo marquee, brand on hover.** Logos sit grey and turn to their own brand colours on hover or focus, as in the reference marquee at https://www.affectui.com/blocks/logo-marquee (MIT, ADR 0010).
- [ ] **Pricing variants.** More pricing layouts next to the current block, studied from the reference's pricing page.
- [ ] **Illustrations.** Animated product illustrations for marketing sections, e.g. a layer stack (https://www.affectui.com/illustrations/layer-stack), ported and restyled.
- [ ] **Motion pieces.** A nicer text reveal (https://www.affectui.com/motion/text-reveal) to replace or sit beside the current one, a shimmer loader (https://www.affectui.com/motion/shimmer-loader), and the rest of the reference's motion set.
- [ ] **AI product components.** Thinking loader, tool call card, message actions, change summary and the like from the reference, merged with what Kosmos already has (tool-call, tool-approval, run-timeline, prompt composer) into one coherent set, plus new blocks built from them.
- [ ] **A proper landing page.** The current landing reads as generic. Before building again: study the strongest component-library landings, decide what Kosmos's page must say and show (message, hero, showcase, proof, pricing, path to install), prototype two or three directions, pick one with the maintainer, then build it from blocks. One direction to prototype: follow the reference landing (https://www.affectui.com) closely, section by section, with its kind of motion (animated illustrations in sections, text reveal, shimmer, marquee with brand on hover). Its site source is not public, only its MIT components (github.com/flohoeller/affectui), so the page is rebuilt from those components and Kosmos blocks, restyled. Research notes and screenshots: `.scratch/research/landings/affectui.md`.
- [ ] **A better bento.** The bento block reads weak. Rebuild it from the Magic UI bento grid (https://magicui.design/docs/components/bento-grid, MIT, ADR 0010), restyled, with live components in the tiles.
- [ ] **Install chip above block previews.** The install command chip above every block preview (next to the device toggles) repeats the install that the page shows below the preview. Remove it from all block pages.
- [ ] **Go live.** When the above is in: release `dev` to `main` (maintainer's PR with a merge commit) and deploy.
- [ ] **MIT catalogue, wave A.** Port the first wave from the MIT catalogue (mockup and screenshot, device frames, marquee primitive, avatar circles, glow and section wrapper, card, spinner, progress, alert dialog and sheet, login and signup blocks).
