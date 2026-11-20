# 25: Pointer and keyboard paths

**What to build:** Every action has a path for the keyboard and for a pointer that cannot drag or aim at a thin target: a data table row opens from a focusable control, a chart's days are easy to hit on a phone, and a kanban card moves without dragging. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Components 10 (data table rows open on click only), Components 14 (chart pointer targets narrower than 24px, WCAG 2.5.8), Blocks 6 (kanban: dragging is the only pointer path, WCAG 2.5.7), Blocks 27 (the kanban board's `rounded-3xl`).

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/ui/data-table.tsx`, `content/docs/components/data-table.mdx` and its example; `registry/kosmos/ui/daily-stacked-bar-chart.tsx`, `flow-chart.tsx`; `registry/kosmos/blocks/kanban-board/`.

- [ ] Data table: `onRowClick`'s JSDoc and the docs say it is a pointer shortcut, and that the row's name cell must hold a link or button that opens the same thing. The docs example shows it, as the Projects table block already does.
- [ ] Daily stacked bar chart: the pointer is tracked over the whole plot and lights the nearest day, as `multi-line-chart` does. The per-day Buttons stay for the keyboard and stop being pointer targets.
- [ ] Flow chart: band value labels get an `after:-inset-*` hit area of at least 24px.
- [ ] Kanban board: each card has a "Move to…" `DropdownMenu` (`Button variant="item" size="icon-sm"`, `aria-label={`Move ${title}`}`) listing the other columns plus Move up and Move down. Each item calls the same `commit()` and makes the same announcement as the keyboard move.
- [ ] Kanban board: the scroller drops `rounded-3xl` (board columns are open lanes with no radius, style skill Dividers between items).
- [ ] No lasting check: each of these needs judgment per caller or a target-size measure the site check does not have. The PR lists the measured target sizes at 375 before and after.
- [ ] A changelog entry for Data table, Daily stacked bar chart, Flow chart and Kanban board.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
