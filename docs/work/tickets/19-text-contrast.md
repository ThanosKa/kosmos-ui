# 19: Text contrast below the floor

**What to build:** No text falls below 4.5:1 in either theme: chart axis labels take `muted-foreground`, tint text keeps its contrast on hover, and logo names stay `foreground` while only the mark takes the brand color. Each fixed pair gets a test, so it cannot slip back. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Components 1 (Recharts 3 ticks render `#666`, 3.0:1 in dark), Components 2 (hue Badge links and the Banner action lose contrast on hover), Blocks 5 and Landing 11 (Logo marquee names in `--logo-color` on hover and focus, one cause).

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/ui/chart.tsx`, `registry/kosmos/ui/badge.tsx`, `registry/kosmos/ui/banner.tsx`, `lib/tints.test.mts` (and `tokens.css`, `tokens.md` only if a tint step is added), `registry/kosmos/blocks/logo-marquee/`, `registry/kosmos/examples/logo-marquee.tsx`, `components/site/stack-brands.ts`; lint (`eslint.config.mjs`, `lib/code-checks.test.mts`).

- [ ] `chart.tsx`: the tick selector names the class Recharts 3 renders, `[&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground`. Check each other `.recharts-*` selector in `ChartContainer` against the markup Recharts 3 renders, and fix every one that matches nothing.
- [ ] A test in `pnpm test` fails when a `.recharts-*` class `chart.tsx` targets does not appear in Recharts' markup (render a fixed-size chart with `react-dom/server`, or measure `/view/chart` in Playwright if server rendering draws no axes).
- [ ] Hue Badge as a link: it keeps a hover background (the style skill, Buttons: "takes the hover background"), on a fill where `tint-*-foreground` passes 4.5:1 for all six tints in light and dark. Use an existing step if one passes; otherwise add a tint hover step to `tokens.css` with its row in `tokens.md`.
- [ ] Banner action: its hover uses the same passing pair, not the generic `bg-accent` over the tint.
- [ ] `lib/tints.test.mts` checks the hover pair for every tint, both themes.
- [ ] Logo marquee: only the mark takes the color (`[&_:is(svg,img)]:text-(--logo-color)`); the name stays `text-foreground`. This also fixes the landing's stack names (React 2.97:1, Tailwind 2.33:1 in light).
- [ ] A lint rule flags `text-(--logo-color…)` that is not scoped to the mark, with a flagged and an allowed snippet in `lib/code-checks.test.mts`; the style skill names it.
- [ ] Measured after the fix: `/view/chart`, `/view/chart-card`, `/view/badge` (hover), `/view/banner` (hover, destructive), `/view/logo-marquee` and `/` (hover and focus), light and dark, every pair at 4.5:1 or more. The PR lists the values.
- [ ] A changelog entry for Chart, Badge, Banner and Logo marquee.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
