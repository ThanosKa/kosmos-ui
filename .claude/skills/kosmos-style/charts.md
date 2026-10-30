# Charts

Every rule in SKILL.md still holds here; this file adds what only charts use.

- Series take `--chart-1` to `--chart-5` in order (on Recharts, ADR 0005): by default a mono ramp, ink then four steps of grey, each 3:1 on `card` and `background`.
- Segments that touch are split in the surface color: stacked bars take a 1px `stroke="var(--card)"`, a segmented meter `gap-px` on its track.
- Values, labels and legends stay in text colors; the mark beside them carries the series.
- A line over time is 1.5px, `type="linear"`, with a faint flat fill of its own color (5% opacity, no gradient).
- A previous period is the same series hue (`--chart-1`) at 45% opacity, 1.5px, solid, with no fill. The ramp is for distinct series.
- The chrome is quiet: no y-axis, only the first and last x labels, a thin vertical cursor line in the tooltip, and a faint dotted vertical grid only on a large chart.
- Sample data is calm: small steps around a trend.
