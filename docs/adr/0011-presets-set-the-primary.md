# A preset's color sets the primary

A preset that brings a color now sets `primary` and `primary-foreground` (and `sidebar-primary` with its foreground) with it, in light and dark. With Console picked, the primary button, a checked checkbox or radio, a switch that is on, the slider range, the tabs indicator and a done step are violet; with Warm they are orange. Default keeps its ink: it has no color to bring. This supersedes the part of ADR 0009 that kept `primary` ink under every preset, and the reason ADR 0007 gave for it. Everything else in ADR 0009 stands: true grays by default, the brand color on the site only, shadows and density the same under every preset.

Developers expect it. shadcn themes and tweakcn presets all color `primary`, and a preset whose buttons stay black while its name says violet reads as broken, as the audit and the maintainer both found. The accent still has its other jobs: `ring`, `sidebar-ring` and `chart-1` take its ring step, `accent-text` its text step.

## The contrast rule

Text on a primary fill (`primary-foreground`) is at least 4.5:1 on the fill in both modes. It stays 4.5:1 under the fill's 90% hover. A Button, checkbox, radio and switch hover to `bg-primary/90`, which moves the fill toward the surface. The fill itself is a 3:1 mark against `background` and `card`. `pnpm test` checks both for every preset, with its accent on and off.

Pick the foreground per preset and mode. White where it passes: Soft, Console and Night in light, where the fill sits a step deeper than the ring. Dark ink where it does not: Warm in light and every preset in dark, where the fill is the lighter accent. White on the orange is 3.5:1, which was ADR 0007's reason to keep it off buttons; dark ink on it is about 6:1, as shadcn does for yellow and orange. A preset may move the primary a lightness step away from the ring step to reach the rule, so `primary` and `ring` can differ a little in lightness while sharing a hue. The Meter's `primary` tone stays on `accent-text`, so it never shares a lightness with `warning` in Warm.

## Considered options

- **Keep the primary ink under every preset (ADR 0009).** Rejected: the maintainer wants a preset to change how the controls look, not only the focus ring and one nav item.
- **Always white text, deepening each accent until it passes.** Rejected: Warm's orange turns brown at the lightness white needs, and dark mode accents are light by nature.
- **A preset-wide `primary-foreground` token chosen by script.** Rejected: a preset states its own pair, so a designer sees and edits it, and the test proves it.

## Consequences

- A preset's `accent` has four steps per mode: `primary`, `onPrimary`, `ring`, `text`. `presetPalette` writes them into `primary`, `primary-foreground`, `sidebar-primary`, `sidebar-primary-foreground`, `ring`, `sidebar-ring`, `chart-1` and `accent-text`, and no other token. The Accent toggle on the Presets page turns all of them off together and returns the ink primary.
- Controls read `primary` only. The Tabs indicator, which took `foreground`, now takes `bg-primary`. The Usage meter's sixth category stays ink on purpose, the start of its ink and gray tail.
- Chart series 2 to 5 are a mono ramp in every preset, Warm included; ADR 0007's multi-hue ramp is gone. Only `chart-1` takes the accent.
- The current page in Pagination counts as navigation and takes `accent-text` like the sidebar and the header. Glow and Flickering grid are decoration and take it too, as a tint.
- `thumb` and the Meter's tone need no preset value: a checked switch thumb takes `primary-foreground`, an unchecked one `thumb`.
