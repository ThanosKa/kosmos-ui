# Charts

Every rule in SKILL.md still holds here; this file adds what only charts use.

- Series take `--chart-1` to `--chart-5` in order (on Recharts, ADR 0005): blue, orange, green, purple, yellow, the same under every preset (ADR 0016), each 3:1 on `card` and `background`. A sixth series folds into "Other".
- Segments that touch are split in the surface color: stacked bars take a 1px `stroke="var(--card)"`, a segmented meter `gap-px` on its track.
- Values, labels and legends stay in text colors; the mark beside them carries the series.
- A line over time is 1.5px, `type="linear"`, with a faint flat fill of its own color (5% opacity, no gradient).
- A previous period is the same series hue (`--chart-1`) at 45% opacity, 1.5px, solid, with no fill. The ramp is for distinct series.
- The chrome is quiet: no y-axis, only the first and last x labels, a thin vertical cursor line in the tooltip, and a faint dotted vertical grid only on a large chart.
- Sample data is calm: small steps around a trend.
- Two charts keep more chrome because their reading needs it: Multi-line chart keeps a value axis and month ticks, since several series over a year need a scale, and Candlestick chart colors a rising candle `success` and a falling one `destructive`, with the direction also in its tooltip and table.

## Chart motion

Every chart takes its entrance from `@kosmos/use-chart-motion`: the hand-drawn ones through `useChartEntrance`, the Recharts ones (Chart, Sparkline, Growth chart, Donut chart) through `useChartAnimation`. A Bar list enters by these rules too; a Meter or Usage meter is a control, not a chart, and only moves when its value changes.

- **Entrance:** once a third of the chart scrolls into view (an IntersectionObserver), never on page load. By default (`entrance="session"`) it plays the first time a chart shows in the browser tab, and every chart after that draws at once with its transitions off: a dashboard is reloaded all day, and an entrance seen that often slows it down. `always` is for a landing page, `none` never plays. A chart without its own `entrance` follows `ChartEntranceContext`; the Kosmos site sets it to `always` in `SiteProvider`, since every page there is a showcase.
- **Order:** structure first (axis labels, track), then the data marks, then values, pills and the tooltip. Each mark enters at `duration-reveal` (500ms), `ease-power3-out`.
- **Stagger:** repeated marks (bars, candles, segments, legend items) start one after another, 10–60ms apart: fewer marks, longer gaps. Segments of one stack build bottom up.
- **Direction:** lines draw left to right with `ease-smooth-in-out`; fills, bands and areas follow the line or flow in behind a clip or mask. A clip-path wipe ends on `[clip-path:inset(0)]`, since `none` snaps instead of animating.
- **Numbers count** (`useCountUp`): from zero on entrance, then from the value shown to each new one, with a screen-reader copy of the final value.
- **Morph, don't remount:** new data, a switched range or a hidden series moves every mark from where it is to its new place, every time, since the person asked for it. Key marks by place, not by label.
- **No overshoot:** no bounce, back or elastic easing.
- **Reduced motion:** the chart and every change cross-fade in opacity; nothing grows, draws or slides.
