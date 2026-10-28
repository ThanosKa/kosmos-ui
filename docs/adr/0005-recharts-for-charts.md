# Recharts for charts

The Chart component builds on Recharts 3 rather than hand-drawn SVG or another library. shadcn's Chart declares `recharts@3` in both its Radix and Base UI styles, and so do the chart layers of most React design systems. A project that installs `@kosmos/chart` often has Recharts already. shadcn chart examples carry over with the same part names (`ChartContainer`, `ChartTooltipContent`, `ChartLegendContent`). Recharts also gives a keyboard layer, responsive sizing, and reduced-motion handling (`isAnimationActive: 'auto'`). A hand-drawn sparkline and growth chart would have to rebuild all three.

_Decided without the user (2026-10-11), pending confirmation._

## Consequences

- Chart is the one Kosmos component that does not build on Base UI. Base UI has no chart primitive, and ADR 0001 lets a component without one use other building blocks.
- `@kosmos/chart` declares `recharts@^3.10.1` and `react-is` (a Recharts peer dependency) as dependencies.
- Kosmos adds `Sparkline` and `GrowthChart` on top of the shared parts; you compose anything else from Recharts directly inside `ChartContainer`.
- A chart with its own docs page ships as its own item that depends on `@kosmos/chart`. Donut chart is the first: a Recharts `Pie` inside `ChartContainer` whose custom `shape` draws each part as a round-capped stroke, so its ring matches Gauge's SVG ring.
- Series colors are the `--chart-1` to `--chart-5` tokens (shadcn names). The config takes `color` only, no per-theme colors, because the tokens switch with the `.dark` class.
- Chart animation uses the `slow` duration (300ms) and the `power3-out` curve from `@kosmos/motion`.
