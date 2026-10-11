---
name: kosmos-style
description: The Kosmos UI style, with the exact tokens and rules for every component, block and page. Load before writing or changing UI in this repo, and when a review skill's finding disagrees with a Kosmos value.
---

# Kosmos style

The values live in one file, `registry/kosmos/styles/tokens.css`, and `/tokens` renders all of them in light and dark. This skill says which token each job takes. Every token, its role and its source is in [tokens.md](tokens.md).

This skill wins every conflict with a review skill (`better-*`, `review-animations`). The conflicts and the value that wins are in [conflicts.md](conflicts.md). When a reviewer flags a value listed there, keep the Kosmos value and mark the finding `Kosmos style` in the report.

## Tokens only

Components reach every color, shadow, radius, easing, duration and text size through a token: `bg-primary`, `text-muted-foreground`, `shadow-popover`, `rounded-xl`, `ease-power3-out`, `duration-fast`, `text-body`. Component files hold no color literal of any notation. Inline `style` carries only CSS variables (`style={{ '--nav-index': i }}`).

Merge classes with `cn` from `@/registry/kosmos/lib/cn` (registry item `@kosmos/cn`), never the bare `cn` package: the default merger reads a type role such as `text-body` as a text color and silently drops the `text-*` color before it.

A missing role gets a new token in `tokens.css`, added in the same change as the component that uses it, with a row in [tokens.md](tokens.md). A token earns its place by a component using it; a token nothing uses is deleted.

Dark mode is the `.dark` class on `<html>`, set by next-themes. Tokens switch on that class only, so components rarely need a `dark:` variant.

## Surfaces: shadows, not borders

Surfaces draw their edge and depth with one layered shadow token, never a depth border. In dark mode each shadow carries a dark outer ring and a 1px inner rim of light, which is the Kosmos signature.

| Surface | Shadow | Fill |
| --- | --- | --- |
| Secondary button, input, select trigger, segmented group | `shadow-control` | `bg-secondary` |
| Primary button | `shadow-primary` | `bg-primary` |
| Card, stat tile, board card | `shadow-card` | `bg-card` |
| Popover, menu, select list, tooltip, toast, command palette | `shadow-popover` | `bg-popover` |
| Dialog, drawer | `shadow-modal` | `bg-popover` |
| Segmented track, switch track, meter track | `shadow-inset` | `bg-muted` |
| Card being dragged | `shadow-lift` | `bg-card` |
| Switch thumb, slider thumb | `shadow-thumb` | `bg-primary-foreground` |

Every element with a shadow ring also takes `border border-transparent`, so forced-colors mode, which drops `box-shadow`, still draws its edge. Overlay backdrops use `bg-scrim`. Content images take `outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10`.

## Dividers between items

Adjacent items in a list, menu or table are separated by one real 1px border in `border-border`, never a shadow or an outline:

- Siblings rendered together: `divide-y divide-border` (or `divide-x`) on the parent.
- Rows that are separate components: `border-b border-border last:border-b-0`.
- Two-dimensional cell grids (stat grids, calendars): `gap-px bg-border` on the grid, `bg-card` on every cell, rows kept full.
- A sidebar docked beside the page: `border-e border-sidebar-border`. It is a divider between two regions, not a raised surface; the same sidebar in its phone drawer takes the drawer's `shadow-modal`.

_Decided without the user (2026-10-11), pending confirmation._ Borders are what forced-colors mode keeps, what screen magnifiers render crisply and what shadcn's Table, Command and Menu use, and `better-ui` keeps borders for dividers. Outlines on adjacent cells stack into a 2px line instead of collapsing to one, and the studied products used three different techniques, so there was no single source convention to keep.

## Radius

Controls take `rounded-lg` (8px), except the 16px checkbox, which takes `rounded-sm` (4px) so it never reads as a radio. Overlays take `rounded-xl` (12px) except tooltips, which take `rounded-lg` because at one line high 12px reads as a pill. Cards take `rounded-2xl` (16px), the top of a bottom sheet `rounded-t-3xl` (20px), and tags, badges and pills `rounded-full`. Nested surfaces with an even inset follow outer radius = inner radius + padding.

_Decided without the user (2026-10-11), pending confirmation._ The tooltip exception: shadcn's and Base UI's tooltips use a control radius too. The checkbox exception: 8px on a 16px box is half its side, which looks like a radio button; 4px is what shadcn, Base UI's demos and most design systems use for a 16px checkbox.

## Color

- One filled `bg-primary` action per view. Its peers take the secondary or ghost look.
- Ghost buttons, nav items, menu items and hoverable rows highlight with `bg-accent`, a translucent overlay that works on every surface.
- `success`, `warning` and `destructive` color dots, icons, meter segments and fills. The text beside them stays `text-foreground` or `text-muted-foreground`, with the meaning also carried by a label or icon. A status Badge is the neutral pill plus a colored dot, never a tinted fill. _Decided without the user (2026-10-11), pending confirmation:_ it follows the rule above that text stays neutral, and it needs no extra color tokens.
- Chart series take `--chart-1` to `--chart-5` in order (on Recharts, ADR 0005). Values, labels and legends stay in text colors; the colored mark beside them carries the series.
- `text-muted-foreground` passes 4.5:1 on `background`, `card` and `muted`. Lighter text roles are not available, by design.

## Typography

Text in components sits between 12 and 14px. Each size is a type role, which sets size, line-height and weight together:

| Role | Size / line-height / weight | Use |
| --- | --- | --- |
| `text-caption` | 12 / 16 / 400 | Meta, badges, keyboard hints, table headers, eyebrows (`uppercase tracking-[0.05em]`) |
| `text-small` | 13 / 1.4 / 400 | Descriptions, hints, errors, menu shortcuts |
| `text-body` | 14 / 20 / 400 | Default UI text: buttons, menu items, table cells, field labels |
| `text-title` | 16 / 24 / 600 | Dialog, drawer and card titles |
| `text-heading` | 20 / 28 / 600 | Page headings in blocks |
| `text-display` | 32 / 40 / 500 | Stat values (always `tabular-nums`) |

- Hierarchy comes from weight (`font-medium` for labels and buttons) and color (`text-muted-foreground`), not from more sizes.
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

- Exits run faster than enters with the same curve and the same distance, reversed.
- Popovers and menus enter from `scale-[0.97]` plus `opacity-0`, growing from the trigger (`origin-(--transform-origin)`). Dialogs enter from `scale-95` plus `opacity-0`, centered. Base UI exposes the start and end states as `data-starting-style` and `data-ending-style`.
- Skeleton loading is Tailwind's `animate-pulse`. It changes only opacity, so it keeps running under reduced motion and needs no `motion-safe:` gate. _Decided without the user (2026-10-11), pending confirmation:_ shadcn's Skeleton uses the same pulse, and a shimmer would need keyframes shipped through `@kosmos/tokens`.
- Interactive state uses transitions, which reverse mid-flight. Keyframes are for looping live states (a ping on a running item, the skeleton pulse).
- The command palette and anything opened by a keyboard shortcut appear without animation.
- Motion code imports the same values from `@/registry/kosmos/lib/motion`: `ease.power3Out`, `duration.fast` (seconds) and `spring` (`{ type: "spring", duration: 0.3, bounce: 0 }`) for layout moves and drag. `/tokens` shows whether that file still matches the CSS.

### Reduced motion is mandatory

Movement, scale and blur run only under `motion-safe:`. Under `prefers-reduced-motion: reduce` the same change becomes an opacity cross-fade, never an instant jump. Motion trees sit inside `<MotionConfig reducedMotion="user">`. An animation without this gate is a blocking bug.

### Press scale

An enabled button scales to `0.96` while pressed: `motion-safe:not-disabled:not-data-disabled:active:scale-96` (`not-disabled` instead of `enabled`, so a Button rendered as a link with `href` scales too, since `:enabled` never matches an `<a>`; `not-data-disabled` covers Base UI's `focusableWhenDisabled`, which drops the native `disabled`; `motion-safe:` instead of a `motion-reduce:` reset, which loses to the extra `:not()` on specificity), with `scale` in the transition list (150ms, `power3-out`). Buttons that sit in dense, repeated rows (menu items, nav items, table row actions, segmented items, tabs) do not scale; they change background only (a `Button` there takes `variant="item"`).

_Decided without the user (2026-10-11), pending confirmation._ A link styled as a Button presses like one: people cannot tell the two apart, and shadcn's Button applies its press feedback to every rendered element, links included.

_Decided without the user (2026-10-11), pending confirmation._ `0.96` is the one value both reviewers accept: `better-ui` prescribes exactly `0.96`, and Emil Kowalski's range is `0.95` to `0.98`. The studied products shipped no working press scale, so there was no source value to keep.

## Focus

Every focusable element shows `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`. An outline keeps the surface's shadow stack intact and survives forced-colors mode. `ring` reaches 3:1 against `background` in both themes.

Two exceptions keep the outline visible where an offset outline would be clipped or have nothing to surround: a tab inside a scrolling tab list draws it inside (`-outline-offset-2`), and the zero-width sidebar resize handle draws it flush (`outline-offset-0`) as a 4px line. _Decided without the user (2026-10-11), pending confirmation:_ the scrolling list clips anything outside its padding box.

## Buttons

Every clickable control is the Kosmos `Button`, and every `<Button>` in Kosmos code passes `variant` explicitly, even when it matches the default. A `Button` with `href` renders a link. Variants describe role (`primary`, `secondary`, `ghost`, `destructive`) or layout slot (`item`: the ghost look without the press scale, for buttons repeated in dense rows such as nav items, menu rows, table row actions and sortable headers); a variant nothing uses is deleted.

ESLint enforces both in this repo (`no-restricted-syntax` in `eslint.config.mjs`). The prop itself stays optional with a `primary` default, so an app that swaps shadcn's Button for ours with `shadcn add -o` still builds. The destructive variant is red text on the secondary surface, not a red fill: the dark `destructive` is too light to carry white text.

One exception: a Badge may render as a link (`render={<a href="…" />}`), a tag that navigates. It keeps the Badge look, takes the hover background and the focus outline, and does not press-scale, because it sits inline with content. _Decided without the user (2026-10-11), pending confirmation:_ shadcn's Badge supports the same link form.

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
| `transition-all`, bare `transition`, `ease-out`, `ease-in-out`, `ease-in`, `duration-150` | Named properties, `ease-power3-out` or `ease-smooth-in-out`, `duration-fast` |
| `translate`, `scale`, `blur` or a `motion.*` animation with no `motion-safe:` or `MotionConfig` gate | Gate it and cross-fade opacity under reduced motion |
| `active:scale-*` other than `scale-96`, or without `motion-safe:not-disabled:not-data-disabled:` | `motion-safe:not-disabled:not-data-disabled:active:scale-96` |
| `<Button>` without `variant`, or a raw `<button>` outside `Button` | Pass `variant`; use `Button` |
| A Tailwind size class or an arbitrary text size (`text-xs`, `text-sm`, `text-lg`, `text-[13px]`); `text-base` only on inputs | The matching type role |
| A number column, stat or counter without `tabular-nums` | Add it |
| `focus-visible:ring-*` or `outline-none` with no replacement | The focus outline above |
| `outline-*` or `shadow-*` used to separate adjacent items | The divider rules above |
