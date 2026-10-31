---
name: kosmos-style
description: The Kosmos UI style rules and tokens. Load before writing or changing UI in this repo, and when a review skill's finding disagrees with a Kosmos value.
---

# Kosmos style

Every value lives in `registry/kosmos/styles/tokens.css`, and the Tokens tab of `/presets` renders them all under the preset and theme picked. This file says which token each job takes; [tokens.md](tokens.md) lists every token, its role and its source, and where a palette value changes.

This skill wins every conflict with a review skill. When a reviewer flags a value listed in [conflicts.md](conflicts.md), keep the Kosmos value and report the finding as `Kosmos style`. That file also holds the reason behind each value a reviewer would question.

Read the file that matches the work before you start:

- Adding a component or block, or its docs page, examples and changelog: [building.md](building.md).
- A marketing block or page (Hero, Logo marquee, Bento, Feature section, Pricing, FAQ, CTA, Testimonials, the landing page): [marketing.md](marketing.md).
- Sample data in a preview, demo or docs page: [demo-world.md](demo-world.md).
- A chart: [charts.md](charts.md).
- Changing the Button component itself: [building.md](building.md), Changing Button.

## Tokens only

Components reach every color, shadow, radius, easing, duration and text size through a token: `bg-primary`, `text-muted-foreground`, `shadow-popover`, `rounded-xl`, `ease-power3-out`, `duration-fast`, `text-body`. Component files hold no color literal of any notation. Inline `style` carries only CSS variables (`style={{ '--nav-index': i }}`).

Merge classes with `cn` from `@/registry/kosmos/lib/cn` (registry item `@kosmos/cn`), never the bare `cn` package: the default merger reads a type role such as `text-body` as a text color and silently drops the `text-*` color before it.

A missing role gets a new token in `tokens.css` (a palette token in `lib/presets/palette.ts` and in every preset, whose contrast tests then cover it), added in the same change as the component that uses it, with a row in [tokens.md](tokens.md). A token earns its place by a component using it; a token nothing uses is deleted.

Dark mode is the `.dark` class on `<html>`, set by next-themes. Tokens switch on that class only, so components rarely need a `dark:` variant.

## Presets with a style

This skill describes the Kosmos style, which Default and Warm keep. Soft, Console, Night and Iris also carry a style of their own (ADR 0014): shadows, type weights and tracking, motion, and CSS rules that reshape components through their `data-slot`, `data-variant`, `data-size` and state attributes. Build to this skill; a preset's rules restyle the result.

- Give every part of a component its own `data-slot`, and expose its variant, size and state as data attributes, so a preset can reach it. Keep the names stable: a preset's rules name them, and `pnpm test` fails when a rule names a slot no component has.
- Buttons and fields stay Kosmos under every preset (ADR 0014). A style never sets `shadow-control`, `shadow-primary`, `shadow-primary-hover`, `primary-hover` or `shadow-field`, and its rules reach a button or a field only for type. `pnpm test` enforces both.
- A preset's style lives in `lib/presets/<id>-style.ts`, never in a component. A component never branches on the preset.
- A style sizes nothing: no `spacing`, text size, line height, height, padding or gap. Size is the visitor's own choice (Compact, Default, Comfortable), which sets `--spacing` alone, so size every part of a component in spacing units (`h-7.5`, `px-2.5`), never in pixels.
- A pill radius that can land on a tall element (a vertical segmented control, an input group around a textarea) is capped at half a control's height (`calc(var(--spacing) * 5)`), not `9999px`, or the tall element turns into an oval.

## Surfaces: shadows, not borders

Surfaces draw their edge and depth with one layered shadow token, never a depth border. In dark mode each shadow carries a dark outer ring and a 1px inner rim of light, which is the Kosmos signature. The popover shadow is the one exception: in dark its inner line is the `input` grey with no top rim, so a menu reads as a thin line inside a dark ring.

| Surface | Shadow | Fill |
| --- | --- | --- |
| Secondary button, segmented group, unticked checkbox or radio | `shadow-control` | `bg-secondary`; ticked or selected `bg-primary` with `shadow-primary` |
| Radio card | `shadow-control`; selected adds a 1px `ring-primary`, the primary edge | `bg-secondary`, hover `bg-muted` while unselected |
| Active sidebar item, current header tab | See Current page in navigation | |
| Input, textarea, select trigger, number field | `shadow-field` | `bg-secondary` |
| Primary button | `shadow-primary`; hover `shadow-primary-hover` | `bg-primary`; hover `bg-primary-hover` |
| Card, stat tile, board card, neutral alert | `shadow-card` | `bg-card` |
| Tinted alert (info, success, warning, destructive) | none: `border border-transparent` | See Status and tints |
| Popover, menu, select list, tooltip, toast, command palette | `shadow-popover` | `bg-popover` |
| Dialog, drawer | `shadow-modal` | `bg-popover` |
| Segmented track, switch track, meter track | `shadow-inset` | `bg-muted` |
| Pricing plan: the featured one / the others | `shadow-card` / `shadow-inset` | `bg-card` / `bg-muted` |
| Panel: the tray / the card inside it | `shadow-inset` / `shadow-card` | `bg-muted` / `bg-card` |
| Card being dragged | `shadow-lift` | `bg-card` |
| Switch thumb, slider thumb | `shadow-thumb` | `bg-thumb`; a checked switch thumb `bg-primary-foreground` |

- Every element with a shadow ring also takes `border border-transparent`, so forced-colors mode, which drops `box-shadow`, still draws its edge.
- A text field's edge is a ring with no drop (`shadow-field`), so it reads as a place to type rather than a button.
- The sidebar count pill and tinted alerts draw their edge with a real 1px border, since there the edge is part of the color, not depth.
- An invalid control adds a 1px `ring-destructive` over its ring; on a dark fill (a ticked checkbox, a selected radio, a switch that is on) the ring is 2px, since 1px vanishes against the ink.
- Hover on a switch track steps it to `bg-input` (on: `bg-primary/90`). Hovering a slider or dragging its thumb rings the thumb in a 4px `ring-foreground/10` halo.
- Overlay backdrops use `bg-scrim`. Content images take `outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10`.
- Sticky chrome is opaque. The Navbar block, and the site header built from it (landing page and docs), is `sticky top-0 bg-background`. Its edge is a `border-b border-border`, a divider like the docked sidebar's, which shows once the page scrolls under the bar (`data-scrolled`), and always on a `fullWidth` bar beside a docked sidebar. A translucent fill fails the text floor (conflicts.md, Accessibility floor).

## Dividers between items

Adjacent items in a list, menu or table are separated by one real 1px border in `border-border`: borders survive forced-colors mode and screen magnifiers, and collapse to one line where outlines on adjacent cells stack into 2px.

- Siblings rendered together: `divide-y divide-border` (or `divide-x`) on the parent.
- Rows that are separate components: `border-b border-border last:border-b-0`.
- Two-dimensional cell grids (month views that hold events, spreadsheets): `gap-px bg-border` on the grid, `bg-card` on every cell, rows kept full.
- Stat tiles are not a cell grid: each is its own card, `gap-4` apart, or `gap-1` when they share one Panel tray as a KPI strip.
- The day grid of a Calendar is not a cell grid either: its days are `item` buttons with room around them, the picked day `bg-primary`, and a range a flat `bg-accent` band behind the days that a divider would cut.
- A sidebar docked beside the page: `border-e border-sidebar-border`, a divider between two regions. The same sidebar in its phone drawer takes the drawer's `shadow-modal`.
- Inside the sidebar, the header, every group after the first and the footer are split by full-width `border-sidebar-border` lines, edge to edge.
- Board columns are open lanes: `divide-x divide-border` on the row, no fill and no radius behind the cards. A board card splits who it is from its numbers with `divide-y divide-border`.

## Overflow

Content that scrolls inside a frame (a dialog or drawer body, a menu, a popover, a horizontal tab list, a command list, a sidebar's content, a board column) scrolls in `ScrollArea`.

- Its edge fade is the one overflow cue: each edge with content hidden past it fades out over 2rem, and the fade leaves as the scroll reaches that edge. The scrollbar shows beside it.
- The frame keeps its fill and shadow and clips; the padding sits inside the scroll area, so content fades out at the frame's edge.
- A list whose items take focus and scroll themselves into view (a menu, a tab list) passes `focusable={false}`; other scrolling content keeps the viewport focusable, so the keyboard can scroll it.
- A horizontal tab list keeps its scrollbar under the divider: it is the one way a mouse without a sideways wheel reaches the hidden tabs.
- A Select list keeps Base UI's scroll arrows instead of the fade: a list aligned over its trigger (`alignItemWithTrigger`) can open with options hidden above it, and the arrows scroll it on hover.

## Radius

`--radius` is 10px. Nested surfaces with an even inset follow outer radius = inner radius + padding, written as a `calc` off the outer step so they stay concentric under every preset's `--radius`.

| Element | Radius |
| --- | --- |
| Controls: buttons, fields, segmented track | `rounded-lg` (10px) |
| Checkbox (16px) | `rounded-sm` (4px): 8px on a 16px box reads as a radio |
| Radio, tags, badges, pills | `rounded-full` |
| Segmented item; number field stepper button | `rounded-md` (8px), inside the `rounded-lg` track or field with `p-0.5` |
| Tooltip | `rounded-lg`: at one line high 14px reads as a pill |
| Dropdown menu, select list, combobox list, sidebar submenu popover | `rounded-lg` with `p-1` |
| Item in those menus, command item, sidebar nav item | `rounded-[calc(var(--radius-lg)-4px)]` (6px) |
| Every other overlay: popover, dialog, drawer, toast, command palette | `rounded-xl` (14px) |
| Alert, radio card | `rounded-xl`: a message or option inside a page, a step below the card it sits in |
| Card | `rounded-2xl` (16px) |
| Card inside a Panel tray or KPI strip (`rounded-2xl` with `p-1`) | `rounded-[calc(var(--radius-2xl)-4px)]` (12px), which no step matches |
| Top of a bottom sheet | `rounded-t-3xl` (20px) |

## Color

### Roles

- One filled `bg-primary` action per view. Its peers take the secondary or ghost look.
- The default palette is true greys and ink (ADR 0009): chroma 0 everywhere except `destructive`, `success`, `warning` and the chart series (ADR 0016). A preset in `lib/presets` may bring an accent and other greys, so a component reaches roles only and never assumes ink or a hue. `pnpm test` checks every preset in both modes.
- A preset's accent (ADR 0011) fills only `primary`, `primary-foreground`, `sidebar-primary`, `sidebar-primary-foreground`, `ring`, `sidebar-ring` and `accent-text` (tokens.md has its steps). A preset without one keeps all of them ink.
- Controls read `primary` (Tabs indicator included), never `foreground`, for a filled or checked state.
- `ring` is the focus color: ink at 55% in the default, the accent in a preset that has one. `shadow-lift` follows it. It is made for 3:1 marks, so it never fills a button or a large surface and never colors text.
- The ring color means focus, so hover never takes it: a hover line or halo is neutral (the sidebar resize handle shows `sidebar-foreground/20`, a slider thumb a `foreground/10` halo).
- Ghost buttons, nav items, menu items and hoverable rows highlight with `bg-accent`, a translucent overlay that works on every surface. (`accent` is shadcn's hover fill, not the preset's accent.)
- Two tones that can stand side by side differ in lightness, not only in hue, so they still read in grayscale and for color-blind readers.
- A scrollbar thumb is `bg-scrollbar-thumb`, lighter than `muted-foreground`, and keeps 3:1 against its `muted` track.

### Grey carries the hierarchy

- Idle chrome steps back to `text-muted-foreground`: sidebar items, tabs, table headers, counts, field labels above a control, and icons in secondary and ghost buttons.
- Values and the selected tab of a Tabs component stay `text-foreground`.
- `text-muted-foreground` passes 4.5:1 on `background`, `card` and `muted`, and it is the faintest text role: meta, placeholders and eyebrows take it too (conflicts.md, Accessibility floor).

### Current page in navigation

The current page colors its label and icon `text-accent-text` (ink by default, the accent's text step in a preset with one) beside idle items in `text-muted-foreground`. This covers the active sidebar item, the current header tab, the current item in a nav menu (which keeps its check mark) and the current page in Pagination.

- Its fill is the flat hover fill with no shadow: `bg-accent`, or `bg-sidebar-accent` in the sidebar.
- In dark mode the active sidebar item is raised instead: `dark:bg-muted dark:shadow-control`.
- Beyond navigation, `accent-text` fills only the Meter's `primary` tone and tints Glow and Flickering grid as decoration. Links and all other text stay ink or muted.

### Status and tints

`success`, `warning` and `destructive` color dots, icons, meter segments and fills. The text beside them stays `text-foreground` or `text-muted-foreground`, and a label, a value or an icon also carries the meaning, so it never rides on color alone.

Six tints (`gray`, `blue`, `green`, `amber`, `red`, `violet`) color every badge, state dot and alert. They are the same under every preset, no tint is a preset's accent, and no tint colors a chart series.

| Thing | Look |
| --- | --- |
| A state (live, pending, waiting) | `StatusDot`: a 6px `bg-tint-*-dot` beside its word, in the text color around it, no pill |
| A status Badge | The neutral pill plus a colored dot |
| A category, a plan or a code | A hue Badge: `bg-tint-*` fill, `text-tint-*-foreground`, no edge. It looks the same everywhere, the current nav item included |
| A change in a stat tile or metric cell | A green ▲ or red ▼ with the signed number in `text-tint-green-foreground` or `text-tint-red-foreground`, then the muted context "vs. last period" |
| A field error | `text-tint-red-foreground` with a 14px `CircleAlert` before the message, aligned to the first line |
| Alert (info blue, success green, warning amber, destructive red) | Filled by default: `bg-tint-*`, `-foreground` text and icon, `border border-transparent`. `appearance="subtle"` is the outline: transparent fill, 1px `border-tint-*-border`. The neutral tone is a card |
| Banner, docs callout | A filled alert. The banner has no divider; only the neutral one keeps a `border-b border-border` against the page |
| A link inside an Alert, Banner or Callout | `text-foreground font-medium` with a soft underline (`decoration-foreground/40`, full on hover), since tint text against foreground is under 3:1 |

- A category keeps one hue everywhere. Plans: Free gray, Pro blue, Scale violet, Trial amber. HTTP status: 2xx green, 4xx amber, 5xx red, 3xx and the rest gray. Methods: GET green, POST blue, PATCH amber, DELETE red.
- `pnpm test` checks tint text at 4.5:1 on its fill and on `background` and `card`, foreground at 4.5:1 on every fill, and dots at 3:1 on the fill and the page. An outline alert on another surface, such as `muted`, is not checked.

## Typography

Text in components sits between 12 and 14px. Each size is a type role, which sets size, line-height, weight and tracking together:

| Role | Size / line-height / weight / tracking | Use |
| --- | --- | --- |
| `text-caption` | 12 / 16 / 400 / 0 | Meta, badges, keyboard hints, table headers, eyebrows (`uppercase tracking-[0.05em]`), sidebar group labels (`uppercase tracking-[0.08em]`, 400) |
| `text-small` | 13 / 1.4 / 400 / -0.005em | Descriptions, hints, errors, field labels above a control |
| `text-body` | 14 / 20 / 400 / -0.01em | Default UI text: buttons, menu items, table cells, checkbox and switch labels |
| `text-title` | 16 / 24 / 600 / -0.02em | Dialog, drawer and card titles; page titles in app chrome at `font-medium` |
| `text-heading` | 20 / 28 / 600 / -0.01em | Docs section headings and titles of site pages outside the app frame (presets). Never in app chrome |
| `text-display` | 32 / 40 / 500 / -0.02em | Stat values, always `tabular-nums` |

`text-hero` and `text-lead` ship in `tokens.css` for marketing blocks only ([marketing.md](marketing.md)). The docs page title is `text-page-title`, a site-only role (tokens.md, Site-only roles).

- Chrome is 500, content is 400. Buttons, header nav items, tabs, segmented items, field labels, badges and the titles of board cards and list rows take `font-medium`. Table cells, descriptions, input values, prose and muted table headers stay 400.
- Menu, select, combobox and command items, sidebar nav items and sidebar group labels are 400 too: a list of many rows reads quieter at the content weight, and the highlight marks the row.
- Hierarchy comes from weight and color (`text-muted-foreground`), not from more sizes.
- Icons are 14px (`size-3.5`) in 30px controls (buttons, nav items, menu items, inputs), 16px in 36px rows and `lg` buttons, and 12px in `sm` buttons and badges.
- Menu and select items are 30px rows (`min-h-7.5`) with 14px icons, matching the trigger they open beside. Command items are 36px rows (`min-h-9`) with 16px icons, for a wide search surface read at a glance whose rows carry a shortcut. In all three, item icons are `text-muted-foreground` and the label stays `text-foreground`.
- A keyboard shortcut is always a `KbdGroup` of `Kbd` keys (`DropdownMenuShortcut`, `CommandShortcut`, inside a tooltip), so it reads the same everywhere.
- Numbers that change or line up (tables, stats, counters, timers, prices) take `tabular-nums`.
- Single-line text in a fixed-width slot takes `truncate`; multi-line takes `line-clamp-*`. Prose measure is set in `em` (`max-w-[40em]`).
- Inputs render `text-base sm:text-body`, so iOS never zooms on focus.
- Fonts are Geist (`font-sans`) and Geist Mono (`font-mono`), loaded with `next/font` in `app/layout.tsx`.

## Motion

Transitions name the properties that change: `transition-[background-color,box-shadow]`. A bare `transition-[…]` already runs at 150ms with `power3-out`, the theme default, so hover and color changes need no duration or easing class.

| Moment | Duration | Easing |
| --- | --- | --- |
| Hover, color, press, menu item highlight | `duration-fast` (150ms), highlight `duration-instant` (100ms) | `ease-power3-out` |
| Popover, menu, select, tooltip open | `duration-base` (200ms) | `ease-power3-out` |
| Dialog open | `duration-overlay` (250ms) | `ease-power3-out` |
| Drawer open, sidebar resize, accordion height, sliding indicator, switch thumb | `duration-slow` (300ms) | `ease-smooth-in-out` for size and position, `ease-power3-out` for slides |
| Any exit | `duration-fast` (150ms) | `ease-power3-out` |
| Accordion close (height and chevron) | `duration-slow` (300ms) | `ease-smooth-in-out` |

- Exits run faster than enters with the same curve and the same distance, reversed.
- The accordion is the one exception: a section closes as it opens, so when one opens as another closes the page below never bounces (conflicts.md, Accordion close). Under reduced motion the closing section collapses at once with no fade and the opening one fades in, so the page shifts once. The chevron follows its section's timing.
- Popovers and menus enter from `scale-[0.97]` plus `opacity-0`, growing from the trigger (`origin-(--transform-origin)`). Dialogs enter from `scale-95` plus `opacity-0`, centered. Base UI exposes the start and end states as `data-starting-style` and `data-ending-style`.
- Interactive state uses transitions, which reverse mid-flight. Keyframes are for looping live states (a ping on a running item, the skeleton pulse).
- Skeleton loading is Tailwind's `animate-pulse`. It changes only opacity, so it keeps running under reduced motion with no `motion-safe:` gate. The Shimmer component is the one sweep, `animate-shimmer` from `@kosmos/tokens`, for status text only and gated by `motion-safe:`.
- The command palette and anything opened by a keyboard shortcut appear without animation.
- Motion code imports the same values from `@/registry/kosmos/lib/motion`: `ease.power3Out`, `duration.fast` (seconds) and `spring` (`{ type: "spring", duration: 0.3, bounce: 0 }`) for layout moves and drag. `pnpm test` checks that file still matches the CSS.

### Reduced motion is mandatory

Movement, scale and blur run only under `motion-safe:`. Under `prefers-reduced-motion: reduce` the same change becomes an opacity cross-fade, never an instant jump. Motion trees sit inside `<MotionConfig reducedMotion="user">`. An animation without this gate is a blocking bug.

### Press scale

An enabled standalone button scales to `0.96` while pressed, with `scale` in its transition list (150ms, `power3-out`): `motion-safe:not-disabled:not-data-disabled:active:scale-96`. Lint enforces that exact string, and each part earns its place: `not-disabled` (not `enabled`) also matches a Button rendered as a link, `not-data-disabled` covers Base UI's `focusableWhenDisabled`, and `motion-safe:` beats a `motion-reduce:` reset on specificity.

- A link styled as a Button presses like one: people cannot tell the two apart.
- Buttons in dense, repeated rows (menu items, nav items, table row actions, segmented items, tabs) change background only: a `Button` there takes `variant="item"`.

## Focus

Every focusable element shows `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`. An outline keeps the surface's shadow stack intact and survives forced-colors mode, and the 2px offset leaves a page-color gap, so an ink outline still reads around an ink primary button. `ring` reaches 3:1 against `background`, `card`, `popover`, `secondary` and `muted`, and `sidebar-ring` against the sidebar, in both modes and every preset.

Text fields (Input, Textarea, Select trigger) light up their own edge instead: `focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-transparent focus-visible:ring-offset-1 focus-visible:ring-offset-ring focus-visible:ring-3 focus-visible:ring-ring/20`.

- The 1px line is a ring offset and the 3px halo a ring, so both are box-shadow and fade together on the field's `transition-[box-shadow]`.
- The transparent outline paints only in forced-colors mode, which drops box-shadow, so the focused field still shows its edge there.
- An invalid field keeps its meaning while focused: line and halo turn `destructive` (`data-invalid:focus-visible:ring-offset-destructive data-invalid:focus-visible:ring-3 data-invalid:focus-visible:ring-destructive/20`, with `aria-invalid:` twins). The `ring-3` repeats, or the invalid `ring-1` wins.

Where an offset outline would be clipped or have nothing to surround:

- An element a clipping container would cut (a tab in a scrolling tab list, an item in a collapsible panel, a scrolling code viewport inside its card) draws it inside: `-outline-offset-2`. Any container with `overflow` other than `visible` clips outside its padding box.
- The zero-width sidebar resize handle draws it flush (`outline-offset-0`) as a 4px line.

## Buttons

Buttons are 30px (`md`) with `px-2.5`; text fields are 34px with `px-3`, so a form reads calmer than its toolbar. A field in a toolbar or beside a Button takes the Button's height (`h-7.5`). Icon buttons in headers and toolbars are `variant="secondary" size="icon"`, a 30px square with the control ring.

- Every clickable control is the Kosmos `Button`, and every `<Button>` in Kosmos code passes `variant` explicitly, even when it matches the default. A `Button` with `href` renders a link.
- Variants describe role (`primary`, `secondary`, `ghost`, `destructive`) or layout slot (`item`: the ghost look without the press scale, for buttons repeated in dense rows such as nav items, menu rows, table row actions and sortable headers). A variant nothing uses is deleted.
- The destructive variant is red text on the secondary surface: the dark `destructive` is too light to carry white text.
- Kosmos code writes the Kosmos variant and size names, never shadcn's (`default`, `outline`, `link`, `xs`, `icon-xs`).
- A Badge may render as a link (`render={<a href="…" />}`), a tag that navigates. It keeps the Badge look, takes the hover background and the focus outline, and does not press-scale, because it sits inline with content.

## Phones

Every component and block works at 375px wide, in light and dark:

- Nothing runs past its frame or scrolls the page sideways. A block sizes by its own width with container queries (`@container`, `@2xl:`); only a page's rhythm uses screen breakpoints ([marketing.md](marketing.md)).
- Text that grows with the data (names, emails, titles, labels) sits in a child with `min-w-0`, then wraps, takes `truncate` or takes `line-clamp-*`. Truncated text stays readable in full somewhere: a `title`, a tooltip or the detail view. Numbers, amounts and dates never truncate; they take `shrink-0`.
- Full-height layouts take `svh` (`min-h-svh`, `h-svh`), as the Sidebar does, since `vh` and `h-screen` ignore the phone's browser bars.
- A surface fixed to the bottom edge pads by `env(safe-area-inset-bottom)`, as the bottom-sheet Drawer does.
- Hover styles use the `hover:` variant, which fires only on a device that can hover, so a tap never leaves a row lit.

## Before you finish

Done when `pnpm lint`, `pnpm types:check` and `pnpm test` pass, plus `pnpm registry:check` when a registry item was added or its dependencies changed.

Run `pnpm lint` first; its message names the fix.

Then search the changed files for each detection lint cannot judge:

| Detection | Fix |
| --- | --- |
| A token in `tokens.css` that no component, block or page uses | Delete it, or use it in this change |
| `border` used for depth on a card, button, input or overlay | Its shadow token from the surface table plus `border-transparent` |
| A `shadow-*` ring without `border border-transparent` | Add it |
| A translucent `bg-background/*` on sticky chrome | `bg-background` |
| A `translate`, `scale` or `blur` transition, or a `motion.*` animation, with no `motion-safe:` or `MotionConfig` gate | Gate it and cross-fade opacity under reduced motion |
| `text-base` outside an input | The matching type role |
| A number column, stat or counter without `tabular-nums` | Add it |
| `focus-visible:ring-*` or `outline-none` with no replacement, outside a text field | The focus outline above |
| A sidebar item in full ink while idle, or an active item raised in light mode | Current page in navigation |
| Accent-colored text other than the current page in navigation | `text-foreground` or `text-muted-foreground` |
| A category label as a neutral or status Badge, or a hue other than the six | One of the six hue variants |
| `text-heading` in an app page header | `text-title font-medium` |
| `text-hero` or `text-lead` in an application block | The app role: `text-display` for a value, `text-title` for a title, `text-body` for text |
| `outline-*` or `shadow-*` used to separate adjacent items | Dividers between items |
| `overflow-auto`, `overflow-y-auto` or `overflow-x-auto` on content inside a frame | `ScrollArea`, as in Overflow |
| Padding (`p-*`, `px-*`, `py-*`, `pt-*`, `pb-*`) on the root of a marketing block | Remove it; the page sets the rhythm ([marketing.md](marketing.md)) |
| A container variant (`@2xl:…`) on the element that is itself `@container` | Move it to a child: a container query never matches its own container |
