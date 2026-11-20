# 21: Text that fits: blocks

**What to build:** In blocks and dashboards, numbers never truncate, truncated text stays readable in full, long words wrap instead of running past the block, and the feature rows media shows its header at mid widths. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Blocks 1 (numbers truncate), Blocks 2 (truncated text with no way back; its Panel and Sidebar causes are fixed in ticket 20), Blocks 3 (long words and labels overflow at phone width), Blocks 14 (feature rows crop the media; visual order differs from DOM order), Blocks 27 (the detail drawer's fixed `h-7.5` on a `dt` that wraps).

**Blocked by:** 16 (its `clipped-text` check proves the fix), 20 (Panel and Sidebar pass the full text through, and the truncation lint rules land there).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/blocks/`: `dashboard-analytics`, `dashboard-crm`, `usage-overview`, `stats-overview`, `navbar`, `members`, `kanban-board`, `feature-rows`, `feature-section`, `bento`, `testimonials`, `detail-drawer`; `registry/kosmos/examples/app-sidebar.tsx`, `app-sidebar-demo.tsx`; lint.

- [ ] Values in the listed places drop `truncate` and take `shrink-0`. The three-column total strips in the dashboards stack as rows below a container width (`grid-flow-row` under `@sm`). Usage overview compacts large currency the way `stats-overview`'s `formatValue` does.
- [ ] Every text the data supplies that truncates in a block (navbar brand and phone sheet links, CRM task title and detail, analytics activation step, members invite line, stats overview chart card description, the app sidebar preview's page `h1`) takes `title={text}`. Dates (the members invite date, the kanban target quarter) take `shrink-0` and no `truncate`.
- [ ] Navbar banner: drop `line-clamp-2`; `linkLabel` moves to its own line below `@sm`.
- [ ] `wrap-break-word` on every heading and description that takes caller text in Feature rows, Feature section, Bento and Testimonials.
- [ ] Feature section action slot: `min-w-0 max-w-full`; the Button label truncates with a `title`.
- [ ] Feature rows: a flipped row crops only its trailing edge (`justify-start`), and the media is placed with `col-start-*` instead of `order-2`. A lint rule flags `order-` in `registry/kosmos/blocks`.
- [ ] Detail drawer: `min-h-7.5` in place of `h-7.5` on the `dt`.
- [ ] Ticket 20's `truncate` with `tabular-nums` rule now also covers `registry/kosmos/blocks`. Each rule change has its snippets in `lib/code-checks.test.mts` and its line in the style skill.
- [ ] `pnpm site-check --check clipped-text --check overflow` reports nothing on the touched previews (`/view/<block>`), light and dark, 375 and 1280. Measured: no number cut at 320 to 1024 wide on the dashboards, usage overview and stats overview.
- [ ] A changelog entry for each changed block.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
