# Black and white palette, with colour from presets

Kosmos ships true greys: a white page and near-black ink in light, the inverse in dark, and no accent. Focus, the current nav item, meters and the first chart series are ink. Charts use a mono ramp, ink then grey steps, and colour enters only through status hues or a preset's accent. This replaces ADR 0007: the maintainer wants Kosmos to read like the black and white dev tools its users already build, and seven research rounds over those products found the same palette each time. Only the palette changes. The style stays as ADR 0004 set it: layered shadows instead of borders, the rim in dark, density, type roles and motion.

Colour now has two separate owners. A **preset** gives the user's project an accent (and the warm cream and orange of ADR 0007 survive as the `Warm` preset). The **brand colour** belongs to the Kosmos site only, on the logo, Pro marks and text selection, and never enters the tokens a user installs.

## Considered options

- **Keep the warm palette as the default.** Rejected: it set Kosmos apart, but the maintainer judged it wrong for the dev-tool products Kosmos targets.
- **Flat cards with hairlines, shadows only on overlays**, as most black and white dev tools do. Rejected: together with their palette it would make Kosmos read as a copy of them, and the layered-shadow style is what gives Kosmos its own identity.
- **Put the brand colour in the shipped tokens**, filling the primary button on app screens. Rejected: every app built on Kosmos would wear the Kosmos brand.
- **Let presets change font and density as well.** Rejected: density is part of the style, and every block would need testing at each density. A preset changes palette and radius only.

## Consequences

- Status hues (gray, blue, green, teal, orange, red) are the only colour in the default, as dots for states and tinted pills for codes. Their values are Radix Colors steps, so the Radix MIT notice ships beside the tokens.
- The focus ring is ink at reduced alpha with a gap in the page colour, at least 3:1 on every surface, and becomes the accent when a preset has one.
- `active-foreground`, `meter-primary` and the `[data-accent]` swatches of ADR 0007 fold into the preset mechanism. A preset's accent has a ring step (`ring`, `sidebar-ring`, `chart-1`) and a text step, one token `accent-text` for the current nav item and the primary Meter, which held the same value in every ADR 0007 mode. Its name keeps clear of shadcn's `accent`, which stays the hover fill.
