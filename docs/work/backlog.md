# Backlog: checks after the black and white release

Status: open
Date: 2026-10-25

Things the maintainer wants checked or built next. Each becomes a ticket in `docs/work/tickets/` when it is picked up.

## Checks

- [ ] **Retro on the black and white run.** What cost the most tokens and time (full review cycles on every ticket, Opus everywhere, usage limits, merges, disk), what to keep, and how the next spec should run (model, review depth, concurrency).
- [x] **Rules that check agents' work.** Done in the audit run (#102): lint and test checks for tokens, Button names, sticky chrome, key-like demo strings, third-party notices and motion scales, plus `pnpm site-check`.
- [ ] **Act on the design review.** `docs/work/design-review.md` ranks the findings of the system design review (the `useControlled` dedupe is done). Pick which to do.
- [ ] **Open decisions.** Go through the decisions collected during the run (`.scratch/decisions-black-and-white.md`) and settle each one.
- [ ] **Decisions from the backlog checks (PR #36).** The Settings confirm dialog leaves focus behind the modal (`initialFocus={false}`): intended or a bug? The docs now use US spelling: move the skills, the ADRs and `GLOSSARY.md` ("Brand colour") to it too? The Members table hides the avatar on narrow cards instead of scrolling sideways: keep it? Showcase screens use `overflow-y-auto`, since `ScrollArea` breaks their full height: change `ScrollArea` or keep the exception?

- [ ] **Decisions from the audit run (#102).**
  - Gauge colors its arc with `accent-text`, which the style keeps for navigation and the Meter: add Gauge to the rule, or move the arc to `primary`?
  - Translation: label props on every component and an `Intl.PluralRules` helper, or English only?
  - Destructive actions in blocks hand off to the app (`onAction`) with no built-in confirmation: keep that?
  - `headingLevel` props on ErrorPage, RunTimeline, Footer, Kanban and Members?
  - Usage overview error state, and the New item dialog keeping typed text on Escape: intended?
  - Iris idle sidebar icons sit at 2.94:1: raise the palette value?
  - Recharts draws in 300ms (`chart.mdx`) but `charts.md` says 500ms: which one?
  - `viewport-fit=cover`, so the Drawer's bottom safe-area padding works on the site: check it on a real phone first.
  - Check on a real phone: sticky hover, tap flashes, the browser bar color, charts below the fold drawing on scroll.
  - The docs sidebar names the first item "Overview", but its pages are titled "About components", "About charts" and "About blocks": which name?
  - Members says "Members" four times: the section label, the `h2`, the `h3` and the table label. Keep it?

- [ ] **Later from the audit run (#102).**
  - More "When to pick which" families: Accordion or Collapsible, Table or Data table, Dropdown menu or Popover or Select.
  - A `--preset` option for `pnpm site-check`.
  - A code check for a dialog or drawer body with no bottom padding.
  - A `pnpm site-check` test against a real preview that is known to be bad.
  - `initials` and `wideGlyph` are copied in five blocks (Members, Dashboard analytics, Dashboard CRM, Usage overview, Run timeline), and the notification panel in both dashboards.
  - `title={typeof x === 'string' ? x : undefined}` repeats about 26 times in `registry/kosmos/ui`.

## Build

- [x] **Example dashboards.** Done: the Analytics and CRM dashboard blocks (#58), with Panel, Bar list and the Stat card KPI header (#55–#57).
- [ ] **Analytics app template.** The dashboard blocks inside the AppSidebar and a header, with more pages (Overview, Users, Revenue, Settings) the sidebar switches between. A natural Pro candidate (ADR 0003).
- [ ] **Dashboards on the landing page.** A section that shows the two dashboards in a browser frame, like the hero.
- [x] **Donut chart.** Done: Donut chart and its legend, drawn like Gauge; the Analytics dashboard and the landing hero use it.
- [ ] **Pricing variants.** More pricing layouts next to the current block. Research first (in `.scratch/`), then prototype: a monthly/yearly toggle where the prices change with motion, and other layouts worth having. The maintainer picks from the prototype.
- [ ] **AI product components.** Thinking loader, tool call card, message actions, change summary and the like from the reference, merged with what Kosmos already has (tool-call, tool-approval, run-timeline, prompt composer) into one coherent set, plus new blocks built from them.
- [ ] **Go live.** When the above is in: release `dev` to `main` (maintainer's PR with a merge commit) and deploy.
- [ ] **MIT catalogue, wave A.** Port the first wave from the MIT catalogue (mockup and screenshot, device frames, marquee primitive, avatar circles, glow and section wrapper, card, spinner, progress, alert dialog and sheet, login and signup blocks).

## Later

Not started until the maintainer decides to go live.

- [ ] **Pro in a private repo.** Each block category keeps one free variant here and gets at least one Pro variant in the private repo, shown live on the site with locked code (ADR 0003).
- [ ] **Templates.** Whole apps built from blocks: SaaS analytics admin, AI assistant workspace, project management, agent ops console, a marketing site in the dashboard style.
- [ ] **Packaging.** Prices, licence, a private registry with a licence key, and payments.
