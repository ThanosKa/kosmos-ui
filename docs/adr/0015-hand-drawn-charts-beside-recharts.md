# Hand-drawn charts beside Recharts

Charts whose motion is the point of them, such as Highlight bar chart, are drawn by hand in HTML and SVG. Chart, Donut chart and any chart composed in `ChartContainer` stay on Recharts (ADR 0005). This partly reverses ADR 0005, which chose Recharts over hand-drawn SVG for every chart.

The lab charts grow their marks one after another, count their numbers, and move every mark from where it is to its new place when the data changes. Recharts animates a whole series as one; it cannot stagger the marks, start them on scroll or count the values. The maintainer wants that motion in the registry.

Every chart, either kind, shares one entrance setting (`entrance`, from `@kosmos/use-chart-motion`). By default it plays the first time a chart shows in the browser tab and draws charts at once after that. A dashboard is reloaded many times a day, and an entrance seen that often slows it down. A change the person asks for, such as a new range, always moves.

## Considered options

- **Rebuild the lab charts on Recharts.** Rejected: custom shapes could draw them, but not stagger, count or start on scroll, so most of the motion would be lost.
- **Move every chart to hand-drawn SVG.** Rejected: Chart keeps shadcn's part names and examples, and a project that installs it often has Recharts already.
- **Play the entrance on every load.** Rejected: right for a landing page, but tiring on a dashboard. `entrance="always"` keeps it for a landing page.

## Consequences

- A hand-drawn chart brings its own keyboard reading, hidden data table and reduced motion fade, which Recharts gave for free.
- The entrance remembers it has played in `sessionStorage`, one flag for every chart, so a new tab plays it again.
- A Recharts chart plays its entrance on mount, not on scroll. While it skips the entrance it keeps Recharts' animation off until its data first changes.
- Ready-made charts have their own docs tab, grouped by kind (a `chart-*` registry group), under `/docs/charts/`. Chart and Chart card, the parts a chart is built from, stay in Components in the `charts` group. Donut chart moved, and its old address redirects.
