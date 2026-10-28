# Backlog: checks after the black and white release

Status: open
Date: 2026-10-25

Things the maintainer wants checked or built next. Each becomes a ticket in `docs/work/tickets/` when it is picked up.

## Checks

- [ ] **Retro on the black and white run.** What cost the most tokens and time (full review cycles on every ticket, Opus everywhere, usage limits, merges, disk), what to keep, and how the next spec should run (model, review depth, concurrency).
- [ ] **Rules that check agents' work.** Use the `writing-for-agents` skill to tighten AGENTS.md and the skills, and turn the rules agents broke this run into lint or test checks so they fail automatically: tokens only (no raw colours), the brand colour never in registry items, a third-party notice on ported items, no key-like demo strings, no blurred sticky headers.
- [ ] **Act on the design review.** `docs/work/design-review.md` ranks the findings of the system design review (the `useControlled` dedupe is done). Pick which to do.
- [ ] **Open decisions.** Go through the decisions collected during the run (`.scratch/decisions-black-and-white.md`) and settle each one.
- [ ] **Decisions from the backlog checks (PR #36).** The Settings confirm dialog leaves focus behind the modal (`initialFocus={false}`): intended or a bug? The docs now use US spelling: move the skills, the ADRs and `GLOSSARY.md` ("Brand colour") to it too? The Members table hides the avatar on narrow cards instead of scrolling sideways: keep it? Showcase screens use `overflow-y-auto`, since `ScrollArea` breaks their full height: change `ScrollArea` or keep the exception?

## Build

- [x] **Example dashboards.** Done: the Analytics and CRM dashboard blocks (#58), with Panel, Bar list and the Stat card KPI header (#55–#57).
- [ ] **Analytics app template.** The dashboard blocks inside the AppSidebar and a header, with more pages (Overview, Users, Revenue, Settings) the sidebar switches between. A natural Pro candidate (ADR 0003).
- [ ] **Dashboards on the landing page.** A section that shows the two dashboards in a browser frame, like the hero.
- [ ] **Donut chart.** A Kosmos component for the ring with a total in its hole and a legend; the Analytics dashboard and the landing hero draw it with a bare Recharts Pie today.
- [ ] **Right-to-left fixes.** `StatCardDelta` text, the Pagination status and GrowthChart's end labels flip or overflow on a right-to-left page.
- [ ] **Pricing variants.** More pricing layouts next to the current block. Research first (in `.scratch/`), then prototype: a monthly/yearly toggle where the prices change with motion, and other layouts worth having. The maintainer picks from the prototype.
- [ ] **AI product components.** Thinking loader, tool call card, message actions, change summary and the like from the reference, merged with what Kosmos already has (tool-call, tool-approval, run-timeline, prompt composer) into one coherent set, plus new blocks built from them.
- [ ] **Go live.** When the above is in: release `dev` to `main` (maintainer's PR with a merge commit) and deploy.
- [ ] **MIT catalogue, wave A.** Port the first wave from the MIT catalogue (mockup and screenshot, device frames, marquee primitive, avatar circles, glow and section wrapper, card, spinner, progress, alert dialog and sheet, login and signup blocks).

## Later

Not started until the maintainer decides to go live.

- [ ] **Pro in a private repo.** Each block category keeps one free variant here and gets at least one Pro variant in the private repo, shown live on the site with locked code (ADR 0003).
- [ ] **Templates.** Whole apps built from blocks: SaaS analytics admin, AI assistant workspace, project management, agent ops console, a marketing site in the dashboard style.
- [ ] **Packaging.** Prices, licence, a private registry with a licence key, and payments.
