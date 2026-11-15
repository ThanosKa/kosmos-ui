# A preset carries its own style

A preset may now bring a style as well as a palette: its own shadows, type weights and tracking, motion, and rules that reshape components by their `data-slot`. Such rules make pill segments, a raised current nav item or mono table heads. Soft, Console, Night and Iris each take the design of their prototype, except for buttons, fields and tabs, which stay Kosmos under every preset. Default and Warm keep the Kosmos style and set a palette only. This supersedes the part of ADR 0009 that kept shadows and motion the same under every preset. Fonts and sizes stay the Kosmos ones under every preset.

The maintainer compared the presets with their prototypes and found that color alone did not carry them: the look of each design came mostly from its shapes. Without them, two presets with a violet accent read as the same preset.

## Buttons, fields and tabs stay Kosmos

Under every preset, buttons and fields keep the Kosmos look. That covers their shape, the bevel and hover of the primary button, the 0.96 press, the control and field shadows, and the focus ring. A style never sets `shadow-control`, `shadow-primary`, `shadow-primary-hover`, `primary-hover` or `shadow-field`. Its rules reach a button or a field only to change its type (font, weight, tracking, case), as in a mono table head.

The maintainer compared the light themes with the Kosmos style and the Kargul reference apps. The presets' pill buttons, flat or glowing primaries and missing press broke both. A button is also the part a project copies most, so it should look the same whichever preset the project took. Fields follow buttons, so a toolbar never pairs a pill field with a 10px button.

Tabs joined them later. Soft drew a tinted pill under the active tab, and Iris a 1px line and a raised view switcher. Console and Night drew the line in another color, Night with a glow. Side by side on the Presets page, the same tab row read as a different control under each preset. Under every preset a tab is now the Kosmos one: a 2px `primary` line under the active tab, in the preset's accent. A view switcher built from tabs keeps its Kosmos track. No rule reaches `tabs-list`, `tabs-trigger` or `tabs-indicator` except for type.

## How a style is built

`Preset.style` holds four parts. `theme` holds tokens that are the same in both modes: type weights and tracking, durations and easings. `light` and `dark` hold the mode tokens, such as shadows. `css` holds the component rules, in the shape of shadcn's registry `css` field. A variable that only a preset's rules read is declared in `css` and named after the preset (`--console-raise`).

- **Get code CSS** writes `theme` into `@theme inline`, so Tailwind builds it into the utilities. Then come `:root` and `.dark`, then the rules.
- **The registry item** ships `theme`, `light` and `dark` as `cssVars`, and the rules as `css`. The shadcn CLI writes the rules outside any layer, so they win over the Tailwind classes in the components.
- **The site** injects the same values at runtime. The `theme` tokens sit on `html:root`, where the site's own theme reads them through `var()`.

## Considered options

- **Component tokens.** Every shape a preset may change would become a token that each component reads, such as a button radius or a nav-item fill. Rejected for now: the four designs need dozens of them, and they would touch every component to express what plain rules on the existing `data-slot` hooks already express. A rule that proves common can still become a token later.
- **Palette and radius only (ADR 0009).** Rejected: it was the reason the presets looked alike.
- **Sizes per preset.** The first version let each style set `spacing`, text sizes, heights and padding, as its prototype did. Rejected after review: switching preset resized the whole interface, so a layout that fit under one preset broke under another, and the prototypes' 11px captions fell below the 12px floor. Size is now its own choice beside the radius (Compact, Default, Comfortable), which sets `--spacing` alone; text sizes stay the type roles.
- **Different fonts per preset.** Rejected: every block would need checking at each font's metrics, and the prototypes' font was the same in all of them.

## Consequences

- `pnpm test` fails when a style sets a control token or a rule reshapes a button, a field or a tab.
- `data-slot` and the `data-variant`, `data-size` and state attributes are now a public surface. Renaming one breaks a preset's rules. `pnpm test` fails when a preset names a slot no component has.
- Rules win over utility classes on the properties they set, so a class a user adds for the same property loses under that preset. The DESIGN.md says so.
- A rule that moves, scales or blurs sits inside `prefers-reduced-motion: no-preference`, a rule sets no font but `font-sans` or `font-mono`, and a style sets no spacing, text size, line height, height, padding or gap. `pnpm test` checks all three, and the contrast tests still cover every palette.
- Motion code reads `registry/kosmos/lib/motion.ts`, which a preset's durations do not reach.
