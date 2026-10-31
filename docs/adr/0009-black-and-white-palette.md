---
status: partly superseded by ADR 0011, which lets a preset's color set the primary, ADR 0014, which lets a preset carry its own style, and ADR 0016, which colors the charts
---

# Black and white palette, with color from presets

Kosmos ships true grays: a white page and near-black ink in light, the inverse in dark, and no accent. Focus, the current nav item, meters and the first chart series are ink. Charts use a mono ramp, ink then gray steps, and color enters only through status hues or a preset's accent. This replaces ADR 0007. The maintainer wants Kosmos to read like the black and white dev tools its users already build. Seven research rounds over those products found the same palette each time. Only the palette changes. The style stays as it was: layered shadows instead of borders, the rim in dark, density, type roles and motion.

Color now has two separate owners. A **preset** gives the user's project an accent (and the warm cream and orange of ADR 0007 survive as the `Warm` preset). The **brand color** belongs to the Kosmos site only, on the logo, Pro marks and text selection, and never enters the tokens a user installs.

## Considered options

- **Keep the warm palette as the default.** Rejected: it set Kosmos apart, but the maintainer judged it wrong for the dev-tool products Kosmos targets.
- **Flat cards with hairlines, shadows only on overlays**, as most black and white dev tools do. Rejected: together with their palette it would make Kosmos read as a copy of them. The layered-shadow style gives Kosmos its own identity.
- **Put the brand color in the shipped tokens**, filling the primary button on app screens. Rejected: every app built on Kosmos would wear the Kosmos brand.
- **Let presets change font and density as well.** Rejected: density is part of the style, and every block would need testing at each density. A preset changes palette and radius only.

## Consequences

- Status hues (gray, blue, green, teal, orange, red) are the only color in the default, as dots for states and tinted pills for codes. Their values are Radix Colors steps, so the Radix MIT notice ships beside the tokens.
- The focus ring is ink at reduced alpha with a gap in the page color. It is at least 3:1 on every surface, and it becomes the accent when a preset has one.
- `active-foreground`, `meter-primary` and the `[data-accent]` swatches of ADR 0007 fold into the preset mechanism. A preset's accent has a ring step (`ring`, `sidebar-ring`, `chart-1`) and a text step. The text step is one token, `accent-text`, for the current nav item and the primary Meter. It held the same value in every ADR 0007 mode. Its name keeps clear of shadcn's `accent`, which stays the hover fill.
- Shadows never take a preset's values. In light they follow its `foreground` through `color-mix`, so a cool preset never gets a warm shadow, and the primary button's rim, drop and hover derive from `primary` the same way. Dark shadows stay black.
