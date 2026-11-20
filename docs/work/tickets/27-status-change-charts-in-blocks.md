# 27: Status, change, charts and ranges in blocks

**What to build:** Blocks show status, change and trends the Kosmos way, and the Analytics dashboard's range picker changes what it claims to. Status is a `StatusDot` with its word, a change is the stat change from the style skill, charts follow `charts.md`, and every panel follows the header's range. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Blocks 7 (presence shown by color alone), Blocks 11 (the header period picker changes only the Traffic panel), Blocks 18 (Usage overview chart breaks the chart rules; range changes remount it), Blocks 19 (a change shown as a hue Badge), Blocks 20 (hand-made status dots), the "vs." wording from Blocks 26, and from Blocks 27: the budget meter stays `warning` past 100%, and the drawer eyebrow's `font-medium`.

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/blocks/`: `dashboard-analytics`, `usage-overview`, `stats-overview`, `feature-section`, `command-menu`, `detail-drawer`, `bento`; `registry/kosmos/examples/page-header-demo.tsx`; `.claude/skills/kosmos-style/demo-world.md` if a range needs new figures; lint.

- [ ] Analytics signups: presence is said in words, in the row's second line ("Online · leila@…"), beside the dot.
- [ ] Analytics: `kpis`, `sources`, `topPages` and `countries` are keyed by `Range`, as `traffic` already is, and each panel description is built from `ranges[range].label`. Figures for the new ranges follow the demo world; add them to `demo-world.md` in this change.
- [ ] Usage overview chart: no `key={range}` (morph, do not remount), `<YAxis hide />`, no horizontal grid, x ticks at the first and last index only, the Chart component's line cursor. Stats overview drops `key={range}` on `GrowthChart` too.
- [ ] A change in a stat is a green ▲ or red ▼ with the signed number in `text-tint-green-foreground` or `text-tint-red-foreground`, then the muted "vs. last period", built with `statDelta(change, { goodWhen })` and the `MetricChange` markup from `stats-overview.tsx`, extracted once and used by Stats overview, Usage overview and Feature section. "vs. last period" is the one wording in all three.
- [ ] Status dots are `StatusDot` with `done`, `pending` or `waiting`: Command menu (its `CommandMenuItem.status` becomes `{ label, state }`), Detail drawer, Bento, the page header demo.
- [ ] Usage overview budget meter: `destructive` past 100%.
- [ ] Detail drawer eyebrow: weight 400 (the eyebrow is `text-caption`, style skill Typography).
- [ ] Lint rules, each with a flagged and an allowed snippet in `lib/code-checks.test.mts` and named in the style skill: `key={range}` on a chart in blocks; a `Badge` whose `variant` picks between `'green'` and `'red'`; a small `rounded-full` span with `bg-success`, `bg-warning` or `bg-muted-foreground` in `registry/kosmos/blocks` or `registry/kosmos/examples`.
- [ ] A changelog entry for each changed block, naming the Command menu `status` type change.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
