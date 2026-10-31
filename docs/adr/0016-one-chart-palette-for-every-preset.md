# One chart palette for every preset

Charts take five colors, blue, orange, green, purple and yellow, the same under every preset and never the preset's accent. This replaces the mono ramp of ADR 0009 for charts only, and takes `chart-1` out of the accent's tokens in ADR 0011. The rest of the palette stays black and white.

The mono ramp read well with one series and failed with several. In a stacked bar, a multi-line chart or a flow chart, four grays sit too close to tell apart, and the maintainer saw charts with no color on every page. Marcel's Kanban app colors its charts too. The maintainer picked the colors; dark mode takes them as given, and light mode keeps their blue and purple and darkens the orange, green and yellow until each reaches 3:1 on every preset's page.

## Considered options

- **Keep the mono ramp.** Rejected: series in neighboring grays are hard to tell apart, for every reader.
- **Color only through a preset.** Rejected: the Default preset, the one most people install, would keep gray charts.
- **Give each preset its own chart colors.** Rejected: five colors per preset per mode to tune and test, and the same dashboard would change meaning from preset to preset.

## Consequences

- `chartColors` in `lib/presets/palette.ts` holds the five colors per mode, and every preset spreads it. `pnpm test` checks each at 3:1 on every preset's page and card.
- The order keeps neighbors apart for color-blind readers on the `dataviz` validator's adjacent pairs, which covers stacks, bars and side-by-side lines. Green and orange, slots 3 and 2, sit in its 6–8 floor band for red-green color blindness. With all five on one plot other pairs come closer still, so a legend or label always names each series.
- Green is also the `success` hue. A green series means a series, not good news; a change in a stat keeps its ▲ or ▼ and sign.
- A preset's accent no longer reaches any chart. A single-series chart is blue under every preset.
- The status hues and the six tints stay separate: no tint colors a series, and a candlestick keeps `success` and `destructive` for direction.
