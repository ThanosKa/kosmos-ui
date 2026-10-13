# Kosmos tokens

Every token in `registry/kosmos/styles/tokens.css`, its job, and where its value came from. Values are in that file only; this table names roles. `/tokens` renders them live.

Colors are the warm neutral palette with an orange accent (ADR 0007). "Light study" and "dark study" are the two studied products whose validated token sets supplied the shadows and the structure of the color roles (ADR 0004). "Adjusted" marks a value changed for contrast, with the reason.

## How the file maps to the registry

| Block in `tokens.css` | shadcn `cssVars` key | Holds |
| --- | --- | --- |
| `@theme inline` | `theme` | Tailwind names pointing at a mode variable (`--color-primary: var(--primary)`, `--shadow-card: var(--shadow-card)`), the radius ladder, font families |
| `@theme static` | `theme` | Values equal in both modes: easings, durations, type roles |
| `:root` | `light` | Light values and `--radius` |
| `.dark` | `dark` | Dark values |

Name new mode-dependent keys inside a Tailwind namespace (`shadow-*`, `color` names without prefix), because the shadcn CLI maps each `light`/`dark` key into `@theme inline` by that name. `lib/tokens.ts` parses the four blocks and is the place to build the registry item from.

## Colors

shadcn names, so components installed with `shadcn add` from any registry pick them up.

| Token | Role | Source |
| --- | --- | --- |
| `background`, `foreground` | Page surface and its text: cream and warm ink in light, warm near-black and off-white in dark | ADR 0007 |
| `card`, `card-foreground` | Cards, tiles: a step lighter than the page in light, a step lighter in dark | ADR 0007 |
| `popover`, `popover-foreground` | Overlays: popover, menu, dialog, drawer, toast | ADR 0007 |
| `primary`, `primary-foreground` | The one filled action per view; also checked checkbox, switch on, slider range. Warm ink with light text in light; light fill with ink text in dark | ADR 0007 (never orange: white on the orange is 3.3:1) |
| `secondary`, `secondary-foreground` | Secondary button and input fill | ADR 0007 |
| `muted` | Track and quiet fills | ADR 0007 |
| `muted-foreground` | Secondary text | Set in both modes to pass 4.5:1 on `background`, `card`, `muted` and `sidebar` |
| `accent`, `accent-foreground` | Translucent hover/highlight overlay for ghost, nav, menu items and rows | Hover overlays of both studies (ink 5% light, white 6% dark) |
| `destructive` | Destructive actions, errors | Adjusted in light to pass 4.5:1 on white and on `muted` (the destructive button's hover); dark study |
| `success`, `warning` | Status dots, icons, meter segments | Adjusted in light to reach 3:1 as graphics on the cream page; dark study |
| `border` | Dividers between items | ADR 0007 |
| `input` | The field edge: `shadow-field` draws it as a ring, and the sidebar count pill as a border. Also the hover fill of an off switch track, one step from `muted`, and `border-input` in components installed from shadcn | ADR 0007 |
| `ring` | Focus outline, and the brand orange wherever the accent appears (`chart-1`, `shadow-lift`; the Meter's `primary` tone takes the deeper `meter-primary`) | ADR 0007: 3.3:1 on the light page, stepped lighter in dark. Never text: it is below 4.5:1 on the light page |
| `active-foreground` | The label and icon of the current page in navigation: the active sidebar item, the current header tab and the current item in a nav menu. The one orange text | ADR 0007 exception. Light `oklch(0.53 0.17 38)`, the `ring` hue darkened to pass 4.5:1; dark = `ring`. Measured 4.61:1 or more on `background`, `secondary`, `sidebar`, `card`, `popover` and the `accent` hovers in both modes |
| `scrim` | Backdrop behind dialogs and drawers | Light study (ink 40%) / dark study (black 60%) |
| `thumb` | Switch and slider thumbs: near-white in both modes, so a thumb reads on the muted track. A checked switch thumb takes `primary-foreground` instead, which contrasts with the `primary` track in each mode | ADR 0007 (the dark `primary-foreground` is ink, too dark for a thumb on the muted track) |
| `scrollbar-thumb` | The ScrollArea thumb: a warm grey lighter than `muted-foreground`, so the scrollbar is never the heaviest mark on the screen | Set in both modes at about 3.3:1 against the `muted` track, just above the 3:1 non-text floor |
| `meter-primary` | The Meter's `primary` tone: the brand orange, a step deeper than `ring` in light | ADR 0007: in light `ring` and `warning` share one lightness and merge in grayscale; the deeper step keeps them apart (about 1.7:1 between the two fills in each mode) and stays clear of `destructive`. Dark keeps `ring`, already lighter apart from `warning` |
| `sidebar-*` | Sidebar surface, text, hover, border, focus, and `sidebar-primary` for a filled mark such as the workspace initial; also themes the docs sidebar | ADR 0007; a step darker than the page in light, focus = `ring` |

Two foregrounds stay although no Kosmos component reads them: `accent-foreground` and `sidebar-accent-foreground`. Components installed from shadcn's registry use them (`hover:text-accent-foreground`, `text-sidebar-accent-foreground`), and without them those classes would compile to nothing. They are the one exception to "a token nothing uses is deleted": shadcn compatibility is their use.

## Chart colors

In their own labelled blocks at the end of `tokens.css` (`lib/tokens.ts` merges repeated blocks), so component-specific tokens don't edit the core blocks.

| Token | Role | Source |
| --- | --- | --- |
| `chart-1` … `chart-5` | Categorical series colors, used in order and never cycled; more than five series fold into "Other" | Slot 1 is the brand orange (`ring` in each mode); slots 2–5 are blue, amber, magenta and green, stepped per mode (ADR 0007). Checked as a set: adjacent-pair separation for protan, deutan and tritan vision, and 3:1 against `card` and `background` in both modes |

## Tag colors

In their own labelled blocks after the chart colors. They exist for the Badge hue variants, which mark categories; status keeps the neutral pill with a dot.

| Token | Role | Source |
| --- | --- | --- |
| `tag-orange`, `tag-blue`, `tag-amber`, `tag-magenta`, `tag-green` | Tag fill: `chart-1` … `chart-5` mixed into transparent at 12% (light) and 16% (dark) | Our chart hues (ADR 0007); the tinted-tag structure comes from the dark study |
| `tag-red` | Tag fill: `destructive` at the same alpha | As above |
| `tag-*-foreground` | Tag text, and its 1px edge at 20% | The same hue stepped to `L 0.47` in light and `L 0.84` (chroma 0.08) in dark, so every pair passes 4.5:1 on its fill over `card` and `background` (light 5.2–6.2:1, dark 7.9–9.2:1) |

## Shadows

| Token | Surface | Structure |
| --- | --- | --- |
| `shadow-control` | Secondary button, segmented group | Light: 1px ring + 1px drop. Dark: dark ring + top rim + inner rim |
| `shadow-field` | Input, textarea, select trigger | One 1px ring in `input`, no drop, in both modes |
| `shadow-primary` | Primary button | Light: flat, one ring in the `primary` fill. Dark: dark ring + drop + top highlight + inner rim + bottom inner shade |
| `shadow-card` | Cards, tiles | Light: 3px soft halo + two drops, no hard ring. Dark: dark ring + drop + rim |
| `shadow-popover` | Popover, menu, tooltip, toast, command palette | Ring + stacked drops; dark adds the rim (inner ring at white 10%, so the edge reads on a dark page) |
| `shadow-modal` | Dialog, drawer | Ring + two deep drops; dark adds the rim (as popover) |
| `shadow-inset` | Tracks: segmented, switch, meter | Sunken inner shadow |
| `shadow-lift` | Card while dragged | Double `ring` (orange) ring + deep drop |
| `shadow-thumb` | Switch thumb, slider thumb | Ring + two short drops, so a near-white knob stands off a white page; dark uses the study's thumb ring and drop |

## Radius

`--radius` is 10px. The ladder: `sm` 4 (checkbox, kbd), `md` 8 (segmented items), `lg` 10 (controls, items, tooltips), `xl` 14 (overlays), `2xl` 16 (cards), `3xl` 20 (sheet top), plus `rounded-full` for pills. The offsets in `@theme inline` keep `sm`, `2xl` and `3xl` at those sizes while `--radius` sets the control radius.

## Motion

| Token | Value | Use |
| --- | --- | --- |
| `ease-power3-out` | `cubic-bezier(0.25, 1, 0.5, 1)` | Default for everything; also the theme's default transition curve |
| `ease-smooth-in-out` | `cubic-bezier(0.7, 0, 0, 1)` | Size and position: sidebar width, indicators, switch thumb, accordion height |
| `duration-instant` / `fast` / `base` / `overlay` / `slow` | 100 / 150 / 200 / 250 / 300ms | See the motion table in SKILL.md |

The same values are in `registry/kosmos/lib/motion.ts` for Motion (`ease.power3Out`, `ease.smoothInOut`, `duration.*` in seconds, `spring`).

Only the curves components use are defined. The rest of the GSAP power family, for a component that needs one, in the same naming:

| Curve | in | out | in-out |
| --- | --- | --- | --- |
| power1 | `0.11, 0, 0.5, 0` | `0.5, 1, 0.89, 1` | `0.45, 0, 0.55, 1` |
| power2 | `0.32, 0, 0.67, 0` | `0.33, 1, 0.68, 1` | `0.65, 0, 0.35, 1` |
| power3 | `0.5, 0, 0.75, 0` | `0.25, 1, 0.5, 1` | `0.76, 0, 0.24, 1` |
| power4 | `0.64, 0, 0.78, 0` | `0.22, 1, 0.36, 1` | `0.83, 0, 0.17, 1` |

## Type roles

`text-caption`, `text-small`, `text-body`, `text-title`, `text-heading`, `text-display`, and for marketing blocks `text-hero` and `text-lead`; sizes in the SKILL.md table. Each sets size, line-height, letter-spacing and, where it differs from 400, weight. Sizes are in `rem`, line-heights unitless. Tracking tightens as size grows (caption 0, small -0.005em, body -0.01em, title and display -0.02em); caption declares its 0 so it resets the tracking it would inherit from body text.

### Site-only roles

`text-page-title` exists only for the title of a docs page: 28px on phones and 32px from the `md` breakpoint, where the docs sidebar docks (a media query in `app/global.css` raises the variable). It is declared in `app/global.css`, not in `tokens.css`, so it never ships in `@kosmos/tokens`, and no component or block uses it. Use it as a plain class, not through `cn`, which does not know it.

## Left out on purpose

- Section padding and max-width tokens, and a marketing heading scale beyond `hero` and `lead`: the studies declared them and never used them in app UI. A marketing block that needs another size adds its role then.
- A press-scale token: press feedback is the `scale-96` utility.
- A fainter text role below `muted-foreground` (for meta, placeholders, eyebrows): it would fall under 4.5:1 in light mode, where `muted-foreground` already sits near the floor. See conflicts.md, Accessibility floor.
