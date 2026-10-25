---
status: superseded by ADR 0009
---

# Warm neutral palette with an orange accent

Kosmos colors are warm neutrals: a cream page, near-white cards, warm grays and a warm near-black ink. The filled primary action is that ink in light mode and its light counterpart in dark mode. One saturated orange is the brand accent. It marks the focus outline, the first chart series, the Meter's `primary` tone and the ring around a dragged card, and it never fills a button or a large surface. Because it means focus, hover never turns anything orange.

This replaces the first palette, which kept neutral grays and used an indigo for the primary action in both modes. The maintainer chose the change after seeing the indigo across the site. The structure behind the style stays as it was: layered shadows, motion, density, radius and type roles.

## Considered options

- **Keep the indigo.** Rejected: the maintainer did not like it, and a saturated primary competes with the content of a dashboard.
- **Orange as the primary fill.** Rejected: white text on this orange is about 3.3:1, below the 4.5:1 that button text needs, and a large orange surface overwhelms a dense UI.
- **Adopt a complete external style file**, with its fonts, flat surfaces, 4px radius and light headings. Rejected: it would replace the layered-shadow style instead of coloring it, and its fonts are not free to ship.

## Consequences

- The values live in `tokens.css` only, and `kosmos-style` `tokens.md` records each role. Apps that install Kosmos still restyle everything through the same shadcn variables.
- The orange is 3.3:1 on the light page. That is enough for focus outlines and chart marks (3:1), but not for text (4.5:1), so text stays ink or muted, and links are ink with an underline.
- One exception colors text orange: the current page in navigation (the active sidebar item, the current header tab and the current item in a nav menu, such as the site's phone menu) takes `active-foreground`, so people see where they are at a glance. It is a darker orange in light, `oklch(0.53 0.17 38)`, and equal to `ring` in dark, and passes 4.5:1 on every surface a nav item sits on in both modes (the measured figures are in `kosmos-style` `tokens.md`). The active sidebar item and current header tab sit on the flat hover fill (`accent`) with no shadow, and buttons stay ink. Any other orange text needs a new decision.
- Dark mode inverts the primary to a light fill with ink text, so switch and slider thumbs take their own `thumb` token instead of `primary-foreground`.
- In light the orange and `warning` share one lightness, so a Meter in the `primary` tone and one in `warning` merged in grayscale. The Meter's `primary` tone takes its own token, `meter-primary`: the same orange a step deeper in light (as light as `destructive`, but apart from it by hue, and `primary` is never one of the auto tones that stand beside it), and `ring` in dark, where `warning` is already much lighter.
- Chart series are orange, blue, amber, magenta and green, in that order. The order was checked so that every adjacent pair stays apart for protan, deutan and tritan vision.
