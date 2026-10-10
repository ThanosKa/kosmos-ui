# Kosmos tokens

Every token in `registry/kosmos/styles/tokens.css`, its job, and where its value came from. Values are in that file only; this table names roles. `/tokens` renders them live.

"Light study" and "dark study" are the two studied products whose validated token sets supplied the light and dark values (ADR 0004). "Adjusted" marks a value changed from the study, with the reason.

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
| `background`, `foreground` | Page surface and its text | Light study / dark study |
| `card`, `card-foreground` | Cards, tiles | Light study / dark study |
| `popover`, `popover-foreground` | Overlays: popover, menu, dialog, drawer, toast | Light study / dark study |
| `primary`, `primary-foreground` | The one filled action per view; indigo in both modes | Dark study's action color, also used in light (adjusted: the light study used near-black, which would give each mode a different identity) |
| `secondary`, `secondary-foreground` | Secondary button and input fill | Light study / dark study |
| `muted` | Track and quiet fills | Light study / dark study |
| `muted-foreground` | Secondary text | Adjusted in both modes to pass 4.5:1 on `background`, `card` and `muted` |
| `accent`, `accent-foreground` | Translucent hover/highlight overlay for ghost, nav, menu items and rows | Hover overlays of both studies (foreground 4% light, white 6% dark) |
| `destructive` | Destructive actions, errors | Adjusted in light to pass 4.5:1 on white and on `muted` (the destructive button's hover); dark study |
| `success`, `warning` | Status dots, icons, meter segments | Adjusted in light to reach 3:1 as graphics; dark study |
| `border` | Dividers between items | Light study / dark study |
| `input` | `border-input` in components installed from shadcn; Kosmos inputs draw their edge with `shadow-control` | Light study / dark study |
| `ring` | Focus outline | `primary` in light; a lighter indigo in dark (adjusted: the action indigo is 2.5:1 on the dark background) |
| `scrim` | Backdrop behind dialogs and drawers | Light study (foreground 40%) / dark study (black 60%) |
| `sidebar-*` | Sidebar surface, text, active item, border, focus; also themes the docs sidebar | Light study / dark study, active item = `primary` |

## Shadows

| Token | Surface | Structure |
| --- | --- | --- |
| `shadow-control` | Secondary button, input, segmented group | Light: 1px ring + 1px drop. Dark: dark ring + top rim + inner rim |
| `shadow-primary` | Primary button | Darker ring + drop + top highlight + inner rim; dark adds a bottom inner shade |
| `shadow-card` | Cards, tiles | Light: ring + 3px soft halo + two drops. Dark: dark ring + drop + rim |
| `shadow-popover` | Popover, menu, tooltip, toast, command palette | Ring + stacked drops; dark adds the rim |
| `shadow-modal` | Dialog, drawer | Ring + two deep drops; dark adds the rim |
| `shadow-inset` | Tracks: segmented, switch, meter | Sunken inner shadow |
| `shadow-lift` | Card while dragged | Double `primary` ring + deep drop |

## Radius

`--radius` is 8px. The ladder: `sm` 4, `md` 6, `lg` 8 (controls), `xl` 12 (overlays), `2xl` 16 (cards), `3xl` 20 (sheet top), plus `rounded-full` for pills.

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

`text-caption`, `text-small`, `text-body`, `text-title`, `text-heading`, `text-display`; sizes in the SKILL.md table. Each sets size, line-height and, where it differs from 400, weight and letter-spacing. Sizes are in `rem`, line-heights unitless.

## Left out on purpose

- Section padding and max-width tokens, and a marketing heading scale: the studies declared them and never used them in app UI.
- A press-scale token: press feedback is the `scale-96` utility.
- Chart colors: the Chart component adds them when it is built.
- Tag tones (colored category pills): Badge marks status with a dot on the neutral pill, so no tones yet. The first component that needs colored categories adds them.
