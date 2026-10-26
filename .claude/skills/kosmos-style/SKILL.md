---
name: kosmos-style
description: The Kosmos UI style, with the exact tokens and rules for every component, block and page. Load before writing or changing UI in this repo, and when a review skill's finding disagrees with a Kosmos value.
---

# Kosmos style

The values live in one file, `registry/kosmos/styles/tokens.css`, and `/tokens` renders all of them in light and dark. Its palette and radius are written there by `pnpm registry:build` from the default preset in `lib/presets`, so a palette value changes in the preset, never in `tokens.css`. This skill says which token each job takes. Every token, its role and its source is in [tokens.md](tokens.md).

This skill wins every conflict with a review skill (`better-*`, `review-animations`). The conflicts and the value that wins are in [conflicts.md](conflicts.md). When a reviewer flags a value listed there, keep the Kosmos value and mark the finding `Kosmos style` in the report.

## Tokens only

Components reach every color, shadow, radius, easing, duration and text size through a token: `bg-primary`, `text-muted-foreground`, `shadow-popover`, `rounded-xl`, `ease-power3-out`, `duration-fast`, `text-body`. Component files hold no color literal of any notation. Inline `style` carries only CSS variables (`style={{ '--nav-index': i }}`).

Merge classes with `cn` from `@/registry/kosmos/lib/cn` (registry item `@kosmos/cn`), never the bare `cn` package: the default merger reads a type role such as `text-body` as a text color and silently drops the `text-*` color before it.

A missing role gets a new token in `tokens.css` (a palette token in `lib/presets/palette.ts` and in every preset, whose contrast tests then cover it), added in the same change as the component that uses it, with a row in [tokens.md](tokens.md). A token earns its place by a component using it; a token nothing uses is deleted.

Dark mode is the `.dark` class on `<html>`, set by next-themes. Tokens switch on that class only, so components rarely need a `dark:` variant.

## Surfaces: shadows, not borders

Surfaces draw their edge and depth with one layered shadow token, never a depth border. In dark mode each shadow carries a dark outer ring and a 1px inner rim of light, which is the Kosmos signature.

| Surface | Shadow | Fill |
| --- | --- | --- |
| Secondary button, segmented group, unticked checkbox or radio | `shadow-control` | `bg-secondary`; ticked or selected `bg-primary` with `shadow-primary` |
| Radio card | `shadow-control`; selected adds a 1px `ring-primary`, the ink edge | `bg-secondary`, hover `bg-muted` while unselected |
| Active sidebar item, current header tab | none (flat) | `bg-accent`, the hover fill |
| Input, textarea, select trigger, number field | `shadow-field` | `bg-secondary` |
| Primary button | `shadow-primary` (flat in light: one ring in the fill color) | `bg-primary` |
| Card, stat tile, board card | `shadow-card` | `bg-card` |
| Neutral alert | `shadow-card` | `bg-card` |
| Tinted alert (info, success, warning, destructive) | none: a 1px `border-tint-*-border` | `bg-tint-*` |
| Popover, menu, select list, tooltip, toast, command palette | `shadow-popover` | `bg-popover` |
| Dialog, drawer | `shadow-modal` | `bg-popover` |
| Segmented track, switch track, meter track | `shadow-inset` | `bg-muted` |
| Pricing plan: the featured one / the others | `shadow-card` / `shadow-inset` | `bg-card` / `bg-muted` |
| Card being dragged | `shadow-lift` | `bg-card` |
| Switch thumb, slider thumb | `shadow-thumb` | `bg-thumb`; a checked switch thumb `bg-primary-foreground` |

An invalid control adds a 1px `ring-destructive` over its ring; on a dark fill (a ticked checkbox, a selected radio, a switch that is on) the ring is 2px, since 1px vanishes against the ink. Hover on a switch track steps it to `bg-input` (on: `bg-primary/90`); hovering a slider or dragging its thumb rings the thumb in a 4px `ring-foreground/10` halo, neutral because the ring color means focus.

Every element with a shadow ring also takes `border border-transparent`, so forced-colors mode, which drops `box-shadow`, still draws its edge. A text field's edge is a ring with no drop (`shadow-field`), so it reads as a place to type rather than a button. Small pills with a colored edge (tags, the sidebar count) and tinted alerts draw it with a real 1px border, since the edge is part of the color, not depth. Overlay backdrops use `bg-scrim`. Content images take `outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10`.

Sticky chrome is opaque. The Navbar block, and the site header built from it (landing page and docs), is `sticky top-0 bg-background`. Its edge is a `border-b border-border`, a divider like the docked sidebar's, which shows once the page scrolls under the bar (`data-scrolled`), and always on a `fullWidth` bar beside a docked sidebar. A translucent fill over a blur cannot hold the text floor: at `bg-background/80`, dark content scrolling under it drops the muted nav labels to 3.2:1 in light and 3.6:1 in dark, and a fill opaque enough to pass hides what the blur would show.

## Dividers between items

Adjacent items in a list, menu or table are separated by one real 1px border in `border-border`, never a shadow or an outline:

- Siblings rendered together: `divide-y divide-border` (or `divide-x`) on the parent.
- Rows that are separate components: `border-b border-border last:border-b-0`.
- Two-dimensional cell grids (month views that hold events, spreadsheets): `gap-px bg-border` on the grid, `bg-card` on every cell, rows kept full. Stat tiles are not a cell grid: each is its own card, `gap-4` apart. Nor is the day grid of a Calendar: its days are `item` buttons with room around them, the picked day `bg-primary`, and a range a flat `bg-accent` band behind the days, like the current nav item, that a divider would cut.
- A sidebar docked beside the page: `border-e border-sidebar-border`. It is a divider between two regions, not a raised surface; the same sidebar in its phone drawer takes the drawer's `shadow-modal`.
- Inside the sidebar, the header, every group after the first and the footer are split by full-width `border-sidebar-border` lines, edge to edge, never inset.
- Board columns are open lanes: `divide-x divide-border` on the row, no fill and no radius behind the cards. A board card splits who it is from its numbers with `divide-y divide-border`.

Borders are what forced-colors mode keeps, what screen magnifiers render crisply and what shadcn's Table, Command and Menu use, and `better-ui` keeps borders for dividers. Outlines on adjacent cells stack into a 2px line instead of collapsing to one, and the studied products used three different techniques, so there was no single source convention to keep.

## Overflow

Content that scrolls inside a frame (a dialog or drawer body, a menu, a popover, a horizontal tab list, a command list, a sidebar's content, a board column) scrolls in `ScrollArea`, and its edge fade is the one overflow cue: each edge with content hidden past it fades out over 2rem, and the fade leaves as the scroll reaches that edge. The scrollbar shows beside it. No shadow, divider, gradient overlay or arrow marks overflow. The frame keeps its fill and shadow and clips; the padding sits inside the scroll area, so content fades out at the frame's edge. A list whose items take focus and scroll themselves into view (a menu, a tab list) passes `focusable={false}`; other scrolling content keeps the viewport focusable, so the keyboard can scroll it.

A horizontal tab list keeps its scrollbar under the divider: with no arrows, it is the one way a mouse without a sideways wheel reaches the hidden tabs. One exception to the fade: a Select list keeps Base UI's scroll arrows, because a list aligned over its trigger (`alignItemWithTrigger`) can open with options hidden above it, and the arrows scroll it on hover, which a fade cannot.

## Radius

`--radius` is 10px. Controls take `rounded-lg` (10px), except the 16px checkbox, which takes `rounded-sm` (4px) so it never reads as a radio, and the radio, which is `rounded-full`. Overlays take `rounded-xl` (14px) except tooltips, which take `rounded-lg` because at one line high 14px reads as a pill. Menu, select and command items take `rounded-lg` inside the `rounded-xl` popup with `p-1`, and segmented items `rounded-md` (8px) inside the `rounded-lg` track with `p-0.5`. Alerts and radio cards take `rounded-xl`: a message or an option inside a page, a step below the card it often sits in. The stepper buttons of a number field take `rounded-md` inside its `rounded-lg` field with `p-0.5`, like segmented items. Cards take `rounded-2xl` (16px), the top of a bottom sheet `rounded-t-3xl` (20px), and tags, badges and pills `rounded-full`. Nested surfaces with an even inset follow outer radius = inner radius + padding.

The tooltip exception: shadcn's and Base UI's tooltips use a control radius too. The checkbox exception: 8px on a 16px box is half its side, which looks like a radio button; 4px is what shadcn, Base UI's demos and most design systems use for a 16px checkbox.

## Color

- One filled `bg-primary` action per view. Its peers take the secondary or ghost look.
- The default palette is true greys and ink (ADR 0009): chroma 0 everywhere except `destructive`, `success` and `warning`. A preset in `lib/presets` may bring an accent and other greys (Warm keeps the cream and orange of ADR 0007), so a component reaches roles only and never assumes ink or a hue. `pnpm test` checks every preset in both modes.
- `ring` is the focus color: ink at 55% in the default, the accent in a preset that has one. `shadow-lift` follows it. It never fills a button or a large surface and never colors text: it is made for 3:1 marks, not 4.5:1 text.
- A preset's accent (`accent` in `lib/presets`) has two steps: a ring step for `ring`, `sidebar-ring` and `chart-1`, and a text step for `accent-text`. Nothing else takes it, and a preset without one keeps all four ink.
- The current page in navigation colors its label and icon `text-accent-text` on the flat `bg-accent` hover fill with no shadow: ink by default, beside idle items in `muted-foreground`, and the accent's text step in a preset with one, at 4.5:1 on every nav surface. That covers the active sidebar item, the current header tab and the current item in a nav menu, which keeps its check mark. The Meter's `primary` tone takes `bg-accent-text` too. Buttons, links and every other text stay ink or muted. (`accent` itself is shadcn's hover fill, not the preset's accent.)
- Ghost buttons, nav items, menu items and hoverable rows highlight with `bg-accent`, a translucent overlay that works on every surface.
- The ring color means focus, so hover never takes it: a hover line or halo is neutral (the sidebar resize handle shows `sidebar-foreground/20`, a slider thumb a `foreground/10` halo).
- Two tones that can stand side by side differ in lightness, not only in hue, so they still read in grayscale and for color-blind readers: the chart ramp steps in lightness, and in Warm the orange `accent-text` that fills a primary Meter sits a step deeper than `ring`, about 1.7:1 from `warning`. The status colors differ by hue and always come with a label, a value or an icon, so their meaning never rides on color alone.
- `success`, `warning` and `destructive` color dots, icons, meter segments and fills. The text beside them stays `text-foreground` or `text-muted-foreground`, with the meaning also carried by a label or icon. A status Badge is the neutral pill plus a colored dot, never a tinted fill.
- Six status tints (`gray`, `blue`, `green`, `teal`, `orange`, `red`) mark states, codes and alerts, the same under every preset; no tint is a preset's accent. A state is a dot and its word with no pill: `StatusDot`, a 6px `bg-tint-*-dot` beside text in the color around it. A code (an HTTP status, a method) is a `tint-*` Badge: fill and `-foreground`, no edge; 2xx green, 4xx orange, 5xx red, others gray; GET green, POST blue, PATCH orange, DELETE red. Inside the current nav item (`aria-current`) a blue, green, orange or red code fills with `-solid` under `tint-solid-foreground`. An Alert, banner or docs callout takes the tint of its tone (info blue, success green, warning orange, destructive red): fill, `-border` edge, `-foreground` text and underlined `-link` links; the neutral tone is a card. Tint text and links pass 4.5:1 on their fill (`pnpm test`). The values are Radix Colors steps (MIT), and `LICENSE-RADIX-COLORS` ships beside `tokens.css` in the tokens item.
- A category (segment, plan, label) is a tag: a Badge hue variant (`orange`, `blue`, `amber`, `magenta`, `green`, `red`). Its fill is the matching `tag-*` token (orange, blue, green and red are the status tints of their hue, amber and magenta the same construction; never a chart series, so tags keep their color under the grey charts), its edge a 1px border of `tag-*-foreground/20`, and its text `tag-*-foreground`, which passes 4.5:1 on the fill. A category keeps one hue everywhere. A change in a stat tile is a `green` or `red` tag beside its muted context.
- Grey carries the hierarchy. Idle chrome steps back to `text-muted-foreground`: sidebar items, tabs, table headers, counts, field labels above a control, and icons in secondary and ghost buttons. Values and the selected tab of a Tabs component stay `text-foreground`; the current page in navigation takes `text-accent-text`.
- Chart series take `--chart-1` to `--chart-5` in order (on Recharts, ADR 0005): by default a mono ramp, ink then four steps of grey, each 3:1 on `card` and `background`. Segments that touch are split in the surface color, so adjacent greys stay apart: stacked bars take a 1px `stroke="var(--card)"`, a segmented meter `gap-px` on its track. Values, labels and legends stay in text colors; the mark beside them carries the series.
- A scrollbar thumb is `bg-scrollbar-thumb`, lighter than `muted-foreground`, and keeps 3:1 against its `muted` track.
- `text-muted-foreground` passes 4.5:1 on `background`, `card` and `muted`. It is the faintest text role: a fainter grey for meta, placeholders or eyebrows would drop below 4.5:1 (see conflicts.md, Accessibility floor).

## Typography

Text in components sits between 12 and 14px; only marketing blocks and the site's marketing sections go larger, for their titles, the line under them and a headline count. Each size is a type role, which sets size, line-height, weight and tracking together:

| Role | Size / line-height / weight / tracking | Use |
| --- | --- | --- |
| `text-caption` | 12 / 16 / 400 / 0 | Meta, badges, keyboard hints, table headers, eyebrows (`uppercase tracking-[0.05em]`) |
| `text-small` | 13 / 1.4 / 400 / -0.005em | Descriptions, hints, errors, field labels above a control |
| `text-body` | 14 / 20 / 400 / -0.01em | Default UI text: buttons, menu items, table cells, checkbox and switch labels |
| `text-title` | 16 / 24 / 600 / -0.02em | Dialog, drawer and card titles; page titles in app chrome at `font-medium`; a name in the Logo marquee |
| `text-heading` | 20 / 28 / 600 / -0.01em | Section headings in the docs and titles of site pages outside the app frame (gallery, tokens); a marketing section title in a container under 672px. Never in app chrome |
| `text-display` | 32 / 40 / 500 / -0.02em | Stat values (always `tabular-nums`); at `font-semibold`, a marketing section title (a block from a 672px container, `@2xl:`) and a hero title in a container under 672px |
| `text-hero` | 48 / 1.1 / 600 / -0.03em | The title of a marketing hero, from a 672px container (`@2xl:`); a count that is the visual of a marketing tile (`tabular-nums`) |
| `text-lead` | 18 / 1.6 / 400 / -0.01em | The one line under a hero title or a marketing section title (in a block from `@2xl:`, `text-body` below); the featured quote in Testimonials |

- The site has one more role, outside this table because no component uses it: `text-page-title`, the title of every docs page (28 / 1.25 / 600 / -0.02em on phones, 32px from `md`). It lives in `app/global.css` and never ships in `@kosmos/tokens` (tokens.md, Site-only roles).
- `text-hero` and `text-lead` are for marketing only. They ship in `tokens.css` with every other role, and application blocks never use them. They are fixed sizes, not fluid ones: a marketing block steps up a role with a container variant (`text-display @2xl:text-hero`), so it sizes by its own width like every block.
- Chrome is 500, content is 400. Buttons, nav items, tabs, menu, select and command items, segmented items, field labels, badges and the titles of board cards and list rows take `font-medium`; table cells, descriptions, input values and prose stay 400. Table headers are 400, muted.
- Hierarchy comes from weight and color (`text-muted-foreground`), not from more sizes.
- Icons are 14px (`size-3.5`) in 30px controls (buttons, nav items, menu items, inputs) and 16px in 36px rows and `lg` buttons; 12px in `sm` buttons and badges.
- Menu and select items are 30px rows (`min-h-7.5`) with 14px icons: a short list that opens beside its trigger and matches its height. Command items are 36px rows (`min-h-9`) with 16px icons: the palette is a wide search surface read at a glance while typing, and its rows carry a shortcut. In all three, item icons are `text-muted-foreground` and the label stays `text-foreground`.
- A keyboard shortcut is always a `KbdGroup` of `Kbd` keys (`DropdownMenuShortcut`, `CommandShortcut`, inside a tooltip), never plain text or a bare `<kbd>`, so it reads the same everywhere and keeps its left-to-right order on a right-to-left page.
- Numbers that change or line up (tables, stats, counters, timers, prices) take `tabular-nums`.
- Single-line text in a fixed-width slot takes `truncate`; multi-line takes `line-clamp-*`. Prose measure is set in `em` (`max-w-[40em]`).
- Inputs render `text-base sm:text-body`, so iOS never zooms on focus.
- Fonts are Geist (`font-sans`) and Geist Mono (`font-mono`), loaded with `next/font` in `app/layout.tsx`.

## Motion

Transitions name the properties that change: `transition-[background-color,box-shadow]`, never `transition-all` or `transition`. A bare `transition-[…]` already runs at 150ms with `power3-out`, the theme default, so hover and color changes need no duration or easing class.

| Moment | Duration | Easing |
| --- | --- | --- |
| Hover, color, press, menu item highlight | `duration-fast` (150ms), highlight `duration-instant` (100ms) | `ease-power3-out` |
| Popover, menu, select, tooltip open | `duration-base` (200ms) | `ease-power3-out` |
| Dialog open | `duration-overlay` (250ms) | `ease-power3-out` |
| Drawer open, sidebar resize, accordion height, sliding indicator, switch thumb | `duration-slow` (300ms) | `ease-smooth-in-out` for size and position, `ease-power3-out` for slides |
| Any exit | `duration-fast` (150ms) | `ease-power3-out` |
| Accordion close (height and chevron) | `duration-slow` (300ms) | `ease-smooth-in-out` |

- Exits run faster than enters with the same curve and the same distance, reversed.
- One exception: an accordion section closes as it opens, height and chevron, 300ms on `ease-smooth-in-out`. When one section opens as another closes, the two heights then add up to a total that moves one way only, so the content below never bounces. Under reduced motion the closing section collapses at once and the opening one fades in, so the page shifts once. CSS cannot tell a swap from a lone close, so every close takes the slow timing. The chevron follows its section's timing, and under reduced motion the closing section collapses without a fade, since a fade at full height would shift the page twice.
- Popovers and menus enter from `scale-[0.97]` plus `opacity-0`, growing from the trigger (`origin-(--transform-origin)`). Dialogs enter from `scale-95` plus `opacity-0`, centered. Base UI exposes the start and end states as `data-starting-style` and `data-ending-style`.
- Skeleton loading is Tailwind's `animate-pulse`. It changes only opacity, so it keeps running under reduced motion and needs no `motion-safe:` gate. shadcn's Skeleton uses the same pulse. The Shimmer component is the one sweep, `animate-shimmer` from `@kosmos/tokens`, for status text only and gated by `motion-safe:`.
- Interactive state uses transitions, which reverse mid-flight. Keyframes are for looping live states (a ping on a running item, the skeleton pulse).
- One motion runs outside the table: the drift (`@/registry/kosmos/lib/drift`) behind the Logo marquee and the Testimonials wall. Content moves at a constant speed (`speed`, pixels per second), one animation frame at a time, as a `transform` on a track with `will-change-transform`. A mouse or pen over it, a finger pressing it or keyboard focus inside it eases it to a stop (time constant 0.32s), and it winds back up when let go (0.7s): ambient motion glides rather than halts. It runs only while on screen, has a pause button (WCAG 2.2.2) and does not run at all under reduced motion, where the content stands still in full.
- The command palette and anything opened by a keyboard shortcut appear without animation.
- Motion code imports the same values from `@/registry/kosmos/lib/motion`: `ease.power3Out`, `duration.fast` (seconds) and `spring` (`{ type: "spring", duration: 0.3, bounce: 0 }`) for layout moves and drag. `/tokens` shows whether that file still matches the CSS.

### Reduced motion is mandatory

Movement, scale and blur run only under `motion-safe:`. Under `prefers-reduced-motion: reduce` the same change becomes an opacity cross-fade, never an instant jump. Motion trees sit inside `<MotionConfig reducedMotion="user">`. An animation without this gate is a blocking bug.

### Press scale

An enabled button scales to `0.96` while pressed: `motion-safe:not-disabled:not-data-disabled:active:scale-96` (`not-disabled` instead of `enabled`, so a Button rendered as a link with `href` scales too, since `:enabled` never matches an `<a>`; `not-data-disabled` covers Base UI's `focusableWhenDisabled`, which drops the native `disabled`; `motion-safe:` instead of a `motion-reduce:` reset, which loses to the extra `:not()` on specificity), with `scale` in the transition list (150ms, `power3-out`). Buttons that sit in dense, repeated rows (menu items, nav items, table row actions, segmented items, tabs) do not scale; they change background only (a `Button` there takes `variant="item"`).

A link styled as a Button presses like one: people cannot tell the two apart, and shadcn's Button applies its press feedback to every rendered element, links included.

`0.96` is the one value both reviewers accept: `better-ui` prescribes exactly `0.96`, and Emil Kowalski's range is `0.95` to `0.98`. The studied products shipped no working press scale, so there was no source value to keep.

## Focus

Every focusable element shows `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`. An outline keeps the surface's shadow stack intact and survives forced-colors mode. The 2px offset leaves a gap in the page color between the element and its outline, so an ink outline still reads around an ink primary button. `ring` reaches 3:1 against `background`, `card`, `popover`, `secondary` and `muted`, and `sidebar-ring` against the sidebar, in both modes and every preset.

Text fields (Input, Textarea, Select trigger) light up their own edge instead: `focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-transparent focus-visible:ring-offset-1 focus-visible:ring-offset-ring focus-visible:ring-3 focus-visible:ring-ring/20`. The 1px line over the field ring is a ring offset and the 3px halo a ring, so both are box-shadow and fade in and out together on the field's `transition-[box-shadow]` (150ms, `power3-out`). The transparent outline paints only in forced-colors mode, which drops box-shadow and gives the outline a system color, so the focused field still shows its edge there. An invalid field keeps its meaning while focused: line and halo turn `destructive` (`data-invalid:focus-visible:ring-offset-destructive data-invalid:focus-visible:ring-3 data-invalid:focus-visible:ring-destructive/20`, with `aria-invalid:` twins; the `ring-3` repeats, or the invalid `ring-1` wins).

A flush 1px `outline-ring` would snap to the full ring color on the first frame while only its halo fades, which reads more abrupt than shadcn's fields, whose border fades and whose neutral halo is faint. As a ring offset the line fades with the halo, and the settled look is the same.

Two more exceptions keep the outline visible where an offset outline would be clipped or have nothing to surround: an element a clipping container would cut (a tab in a scrolling tab list, an item in a collapsible panel, a scrolling code viewport inside its card) draws it inside (`-outline-offset-2`), and the zero-width sidebar resize handle draws it flush (`outline-offset-0`) as a 4px line. A container with `overflow` other than `visible` clips anything outside its padding box.

## Buttons

Buttons are 30px (`md`) with 14px icons and `px-2.5`; text fields are 34px with `px-3`, so a form reads calmer than its toolbar. A field in a toolbar or beside a Button takes the Button's height (`h-7.5`). Icon buttons in headers and toolbars are `variant="secondary" size="icon"`, a 30px square with the control ring, not a bare ghost glyph.

Every clickable control is the Kosmos `Button`, and every `<Button>` in Kosmos code passes `variant` explicitly, even when it matches the default. A `Button` with `href` renders a link. Variants describe role (`primary`, `secondary`, `ghost`, `destructive`) or layout slot (`item`: the ghost look without the press scale, for buttons repeated in dense rows such as nav items, menu rows, table row actions and sortable headers); a variant nothing uses is deleted.

One exception to that deletion: the Button also takes shadcn's names as aliases, so shadcn components (Dialog, Alert Dialog, Pagination) keep working in an app that swaps shadcn's Button for ours. Variant `default` renders `primary`, `outline` renders `secondary`, and `link` is an ink text link that underlines on hover and does not press-scale; size `default` renders `md`, `xs` renders `sm` and `icon-xs` renders `icon-sm`. `data-variant` and `data-size` carry the Kosmos name. Kosmos code never writes an alias, and `pnpm registry:smoke` proves the swap builds.

ESLint enforces all three in this repo (`no-restricted-syntax` in `eslint.config.mjs`, which also lints the tsx code blocks of the docs pages). The prop itself stays optional with a `primary` default, so an app that swaps shadcn's Button for ours with `shadcn add -o` still builds. The destructive variant is red text on the secondary surface, not a red fill: the dark `destructive` is too light to carry white text.

One exception: a Badge may render as a link (`render={<a href="…" />}`), a tag that navigates. It keeps the Badge look, takes the hover background and the focus outline, and does not press-scale, because it sits inline with content. shadcn's Badge supports the same link form.

## Marketing pages

A marketing block (Hero, Logo marquee, Bento, Feature section, Pricing, FAQ, CTA, Testimonials) sets no padding around itself: the page that stacks them sets one rhythm, so two blocks never add their padding up into a gap of their own. Spacing inside a block (title to content, content to its link) stays the block's.

- Each section sits in a column with `px-4 sm:px-6` gutters and keeps space below it only: `pb-20` (80px) on phones, `md:pb-28` (112px) from 768px. The page sets it with screen breakpoints, because the rhythm belongs to the page, not to any block's width.
- The hero takes room above it, `pt-16 md:pt-24`, and less below, `pb-10 md:pb-12`, when a showcase or strip that belongs to it follows (a Showcase right under it, or a Logo marquee of the stack or of customers), so the product shows in the first screen.
- The last section before the footer keeps `pb-28 md:pb-40`, so the page ends on a pause rather than on the footer's edge.
- The text column is `max-w-5xl`; a showcase (a live app in a frame, a grid of tiles) widens to `max-w-6xl`. The FAQ keeps its own 672px column inside it.
- Every section follows one grammar: a centered title, at most two short lines split at a comma (`<br />`), then optional tabs, then the content, then at most one `secondary` link to see more. No eyebrow, and a line under the title only when the title cannot carry the point alone.

A block's demo and review preview wrap it in the same padding a page would give it (`px-4 py-14 sm:px-6 sm:py-20` in the demo frame).

## Before you finish

Search the changed files for each detection. Size classes need a pattern that stops at the class name, because a plain `text-sm` also matches the valid `text-small`:

```bash
grep -nE "text-(xs|sm|lg|[2-9]?xl)([^a-z0-9-]|$)|text-\[[0-9.]+(px|rem|em)\]" <files>
```

| Detection | Fix |
| --- | --- |
| `#`, `rgb(`, `hsl(` or `oklch(` in a `.tsx` file | The role token; add one in `tokens.css` if the role is new |
| A token in `tokens.css` that no component, block or page uses | Delete it, or use it in this change |
| `border` used for depth on a card, button, input or overlay | Its shadow token from the surface table plus `border-transparent` |
| A `shadow-*` ring without `border border-transparent` | Add it |
| `backdrop-blur`, or a translucent `bg-background/*` on sticky chrome | `bg-background` |
| `transition-all`, bare `transition`, `ease-out`, `ease-in-out`, `ease-in`, `duration-150` | Named properties, `ease-power3-out` or `ease-smooth-in-out`, `duration-fast` |
| `translate`, `scale`, `blur` or a `motion.*` animation with no `motion-safe:` or `MotionConfig` gate | Gate it and cross-fade opacity under reduced motion |
| `active:scale-*` other than `scale-96`, or without `motion-safe:not-disabled:not-data-disabled:` | `motion-safe:not-disabled:not-data-disabled:active:scale-96` |
| `<Button>` without `variant`, or a raw `<button>` outside `Button` | Pass `variant`; use `Button` |
| A shadcn name on a Button (`variant` `default`, `outline`, `link`; `size` `default`, `xs`, `icon-xs`) | The Kosmos name it renders as |
| A Tailwind size class or an arbitrary text size (`text-xs`, `text-sm`, `text-lg`, `text-[13px]`); `text-base` only on inputs | The matching type role |
| A number column, stat or counter without `tabular-nums` | Add it |
| `focus-visible:ring-*` or `outline-none` with no replacement, outside a text field | The focus outline above |
| A sidebar item in full ink while idle, or an active item with a raised surface | `text-muted-foreground` idle; flat `bg-accent` (`bg-sidebar-accent` in the sidebar), no shadow, and `text-accent-text` (label and icon) when active |
| `text-ring`, `text-chart-*`, or accent-colored text other than the current page in navigation | `text-foreground` or `text-muted-foreground`; the current nav item takes `text-accent-text` |
| A category label as a neutral or status Badge | A hue variant |
| `text-heading` in an app page header | `text-title font-medium` |
| `text-hero` or `text-lead` in an application block | The app role: `text-display` for a value, `text-title` for a title, `text-body` for text |
| `outline-*` or `shadow-*` used to separate adjacent items | The divider rules above |
| `overflow-auto`, `overflow-y-auto` or `overflow-x-auto` on content inside a frame | `ScrollArea`, as in Overflow above |
| Padding (`p-*`, `px-*`, `py-*`, `pt-*`, `pb-*`) on the root of a marketing block | Remove it; the page sets the rhythm (Marketing pages above) |
| A container variant (`@2xl:…`) on the element that is itself `@container` | Move it to a child: a container query never matches its own container |
