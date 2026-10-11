# Recharts for charts

The Chart component is built on Recharts 3 rather than hand-drawn SVG or another library. shadcn's Chart (in both its Radix and Base UI styles) declares `recharts@3`, and so do the chart layers of most React design systems, so a project that installs `@kosmos/chart` usually has Recharts already, and shadcn chart examples carry over with the same part names (`ChartContainer`, `ChartTooltipContent`, `ChartLegendContent`). Recharts also gives a keyboard layer, responsive sizing and reduced-motion handling (`isAnimationActive: 'auto'`) that a hand-drawn sparkline and growth chart would have to rebuild.

_Decided without the user (2026-10-11), pending confirmation._

## Consequences

- `@kosmos/chart` declares `recharts` and `react-is` (a Recharts peer dependency) as dependencies.
- Kosmos adds `Sparkline` and `GrowthChart` on top of the shared parts; anything else is composed from Recharts directly inside `ChartContainer`.
- Series colors are the `--chart-1` to `--chart-5` tokens (shadcn names). The config takes `color` only, no per-theme colors, because the tokens switch with the `.dark` class.
- Chart animation uses the `slow` duration (300ms) and the `power3-out` curve from `@kosmos/motion`.
