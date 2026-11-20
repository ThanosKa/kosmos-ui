# 35: Chart motion

**What to build:** The Recharts charts Kosmos ships draw in once they scroll into view and fade under reduced motion instead of jumping; the Candlestick chart's tooltip glides like the other charts' without laying the page out each frame; and the docs' chart examples draw with the Kosmos timing they tell people to use. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Motion 1 (Recharts charts jump under reduced motion and play on mount), Motion 3 (Candlestick slides on `left` and `top`), Motion 4 (examples on Recharts' own timing).

**Blocked by:** None. Runs beside 34 and 36 (no shared file).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/hooks/use-chart-motion.ts`, `registry/kosmos/ui/chart.tsx`, `registry/kosmos/ui/candlestick-chart.tsx`, `registry/kosmos/blocks/usage-overview/usage-overview.tsx`; `registry/kosmos/examples/chart.tsx`, `chart-custom.tsx`, `chart-card.tsx`, `chart-card-legend.tsx`; `content/docs/components/chart.mdx`; one changelog entry.

Written at commit `4c91ba8`. If a quoted line no longer matches the code, stop and report instead of improvising.

## Values

- Entrance and data changes, motion allowed: unchanged, Recharts with `chartAnimation` (`chart.tsx:29-33`): 300ms (`duration.slow`), `power3-out`. The 300ms against `charts.md`'s 500ms is a maintainer decision (audit.md Motion, Not doing); do not change it.
- When: once a third of the chart is in view (`useChartEntrance`), following the `entrance` prop and `ChartEntranceContext` as today.
- Reduced motion: the chart fades in, `transition-[opacity] duration-reveal ease-power3-out motion-reduce:starting:opacity-0`, on first show and again on each new `data` (a remount), as `compare-area-chart.tsx:150-190` does.
- Candlestick tooltip and cursor slide: `translate`, `duration-slow` (300ms), `ease-smooth-in-out`, as `daily-stacked-bar-chart.tsx:405-415`.

## Checklist

- [ ] **Hook.** In `use-chart-motion.ts`, add and export `useRechartsEntrance(ref, entrance, data)`. It calls `useChartEntrance(ref, entrance)` and `useReducedMotion()`; keeps a `version` that goes up whenever `data` changes (the `shownData`/`version` pattern of `compare-area-chart.tsx:153-158`); keeps `stillData` (`if (instant && stillData !== data) setStillData(data)`, `compare-area-chart.tsx:160-162`); and returns `{ revealed, isAnimationActive: stillData === data ? false : 'auto', remountKey: reduced ? version : 'chart' }`. Leave `useEntranceAnimation` and `useChartAnimation` as they are: apps that compose a chart still use them (`chart.mdx:50`).
- [ ] **Sparkline line** (`chart.tsx:252-288`). Render an always-present `div` that takes `data-slot="sparkline"`, `role="img"`, the size classes (`cn('aspect-auto h-8 w-24', className)`), `...props` and the ref. Inside it, only when `revealed`, render the `ChartContainer` with `key={remountKey}` and `className="size-full transition-[opacity] duration-reveal ease-power3-out motion-reduce:starting:opacity-0"`. Spread `{...chartAnimation}` then `isAnimationActive={isAnimationActive}` on the `Area`.
- [ ] **Sparkline bars** (`chart.tsx:299-344`). The outer `div` already exists: put the ref on it, mount the `ChartContainer` only when `revealed`, add `key={remountKey}` and the same fade classes to it, and pass `isAnimationActive` to the `Bar`. Call the hook once in `Sparkline` and pass its result to `SparklineBars` in place of `animation`.
- [ ] **Growth chart** (`chart.tsx:371-473`). Put the ref on the `figure`, mount the `ChartContainer` only when `revealed` with `key={remountKey}` and the fade classes, and spread `{...chartAnimation}` plus `isAnimationActive` on its series in place of `animation`. Keep the hidden table and the legend rendered at all times.
- [ ] **Usage overview** (`usage-overview.tsx:294` and `:369-408`). Replace `useChartAnimation(undefined, data.daily)` with `useRechartsEntrance(figureRef, undefined, data.daily)`, put `figureRef` on the `figure` at `:369`, and do the same as Growth chart: `ChartContainer` only when `revealed`, `key={remountKey}`, the fade classes beside `aspect-auto h-60`, and `{...chartAnimation}` plus `isAnimationActive` on each `Recharts.Bar`. The `sr-only` table stays rendered.
- [ ] **Candlestick cursor** (`candlestick-chart.tsx:557-566`). Now `'pointer-events-none absolute top-0 left-(--x) h-(--h) w-0 …'` and `slides && 'motion-safe:transition-[opacity,left] motion-safe:duration-base'`. Make it `left-0 translate-x-(--x)` and `slides && 'motion-safe:transition-[opacity,translate] motion-safe:duration-slow motion-safe:ease-smooth-in-out'`.
- [ ] **Candlestick tooltip** (`candlestick-chart.tsx:610-619`). Now `'pointer-events-none absolute top-(--y) left-(--x) …'` and `slides && 'motion-safe:transition-[opacity,left,top] motion-safe:duration-base'`. Make it `top-0 left-0 translate-x-(--x) translate-y-(--y)` and `slides && 'motion-safe:transition-[opacity,translate] motion-safe:duration-slow motion-safe:ease-smooth-in-out'`. Keep the `slides` gate, so the first show fades in place. Do not key the tooltip: `useSize` (`:143-157`) observes the first element only.
- [ ] **Examples.** In `chart-custom.tsx`, `chart-card.tsx` (both charts), `chart-card-legend.tsx` and the palette chart of `chart.tsx:130-143`, call `const animation = useChartAnimation(undefined, <the chart's data>)` in the component and spread `{...animation}` on every `Bar`, as `chart.mdx:50` tells readers to.
- [ ] **Docs.** `chart.mdx:56`: say that Sparkline and Growth chart draw in over 300ms once a third of the chart is in view, and under the reduced motion setting fade in instead, and fade in again when their data changes; a chart you compose with `useChartAnimation` draws on mount and skips the animation under that setting.
- [ ] Read `~/.claude/skills/review-animations/SKILL.md` (the Skill tool refuses it) and apply it to this diff by hand. A row that matches `conflicts.md` is "Kosmos style" and does not block. List its verdict in the PR.
- [ ] Feel check on the dev server. `/view/chart`, `/view/usage-overview` and a stat tile with a Sparkline below the fold: the draw starts when the chart scrolls in, not before. With `prefers-reduced-motion: reduce` emulated, switch the Usage overview range: the bars fade in, they do not snap. `/view/candlestick-chart`: sweep the pointer across the candles; the tooltip and the dashed line glide like Daily stacked bar chart's, and the Performance panel shows no layout per frame while they glide.
- [ ] `pnpm site-check --port <yours> --route /view/chart --route /view/usage-overview --route /view/candlestick-chart --check console` reports nothing.
- [ ] A changelog entry (`content/docs/changelog/`, copy the newest) for Chart (Sparkline, Growth chart), Usage overview and Candlestick chart.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.

## Boundaries

- Do not change `chartAnimation`'s duration or easing, the hand-drawn charts, or Compare area chart.
- Do not change `useChartAnimation`'s signature or behavior; it is public.
- No new dependency, no new token.
