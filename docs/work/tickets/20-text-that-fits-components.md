# 20: Text that fits: components and docs

**What to build:** In components and the docs foundations, text that does not fit stays readable in full somewhere, numbers never truncate, and no hidden label pushes the page sideways. The rule is the style skill's (Phones): "Truncated text stays readable in full somewhere: a `title`, a tooltip or the detail view. Numbers, amounts and dates never truncate." Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Components 3 (Model select's `sr-only` labels widen the page 223px), Components 4 (truncated slots with no way to the full value), Components 5 (stat value truncates), Components 17 (Donut chart preview controls overflow 9px), Docs 1 (color token name cut on the Color page).

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/ui/`: `model-select`, `panel`, `status`, `sidebar` (labels), `chart` (tooltip series name), `multi-line-chart`, `compare-area-chart`, `highlight-bar-chart`, `segmented-gauge`, `command` (item description), `data-table` (filter summary), `announcement`, `input-group`, `stat-card`; `registry/kosmos/examples/donut-chart.tsx`; `components/docs/foundations/copy-swatch.tsx`; lint.

- [ ] Model select: `relative` on the trigger's class list (`ModelSelectButton`), as `sidebar.tsx` and `scroll-area.tsx` already do, so the `sr-only` spans stay inside it. The Button base is not changed.
- [ ] Donut chart preview: `flex flex-wrap gap-2` on the row of shift Buttons (`examples/donut-chart.tsx`, about line 150).
- [ ] Stat card: the value drops `truncate` and takes `shrink-0`; the label beside it takes `min-w-0`. A value wider than its card steps down a role by container width (`text-title` below the width where `text-display` no longer fits).
- [ ] Every slot listed in Components 4 gives the full text: `title={…}` where the child is a string; Panel title and description, and the sidebar menu button label while expanded, pass a `title` through (the sidebar can take it from its `tooltip` text).
- [ ] Copy swatch: `min-w-0 wrap-break-word` in place of `truncate` on the token name.
- [ ] Two lint rules, each with a flagged and an allowed snippet in `lib/code-checks.test.mts` and named in the style skill: `truncate` together with `tabular-nums` or `text-display` in one class list in `registry/kosmos/ui` (ticket 21 extends it to blocks once they are fixed); `truncate` or `line-clamp-*` on an element with no `title` in `registry/kosmos/ui`, with an allowlist in the rule config for slots whose full text lives in a tooltip or detail view, each entry with its reason.
- [ ] `pnpm site-check --check overflow --route /view/model-select --route /view/donut-chart` reports nothing.
- [ ] A changelog entry for each changed component.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
