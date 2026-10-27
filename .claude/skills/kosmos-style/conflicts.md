# Conflicts with the review skills

The review skills check Kosmos UI; they do not set its values. Where one of them asks for something else, the Kosmos value below wins. Report such a finding as `Kosmos style` with the row it matches, and do not change the code.

Reviewers: `emil-design-eng`, `review-animations`, `animate`, `break-ui` and `mobile-native` (Emil Kowalski), `better-accessibility`, and `dataviz` for charts.

## Motion

| Point | Reviewer says | Kosmos value (wins) | Why |
| --- | --- | --- | --- |
| Press scale | Emil `0.97` (range 0.95–0.98) | `0.96`, 150ms, `power3-out`, every enabled standalone Button, its link form included | Inside Emil's range |
| Easing curves | Emil: his own `--ease-out` `(0.23, 1, 0.32, 1)`; `ease` for hover | `power3-out` `(0.25, 1, 0.5, 1)` for enter, exit, hover and icon swaps; `smooth-in-out` for size and position | One curve family shared by Tailwind and Motion |
| Exit curve | Emil: never ease-in | `power3-out`, same as enter | Agrees with the reviewers; the studied overlay exits used `power3-in`, which Kosmos drops |
| Accordion close | Emil: exits shorter than enters, as the Kosmos exit row says | Accordion height closes in 300ms on `smooth-in-out`, as it opens | A swap moves two heights at once; a faster close makes the total dip and the page bounce |
| Overlay start scale | Emil: from 0.9–0.97 | Popover/menu `0.97`, dialog `0.95` | Inside Emil's range; matches the studied overlays |
| Spring bounce | Emil: 0.1–0.3 when used | `bounce: 0`, `duration: 0.3` | Calm motion |
| Stagger | Emil: 30–80ms between items | No stagger in components. Blocks and the landing page: 100ms between chunks (title, text, actions), 40ms between repeated items, 300ms total cap | Repeated items sit inside Emil's range; chunks are slower so a block reads in order |
| Durations | Emil: UI under 300ms, drawers 200–500ms | Fixed set 100/150/200/250/300ms, drawer 300ms | The studied drawer ran 350ms; 300ms satisfies both rules |
| Hover gating | Emil: `(hover: hover) and (pointer: fine)` | Tailwind 4 `hover:` as is (`(hover: hover)`) | One mechanism |

## Surfaces and color

| Point | Reviewer says | Kosmos value (wins) | Why |
| --- | --- | --- | --- |
| Input boundary | `better-accessibility`: inputs keep a border with 3:1 contrast | `shadow-control` ring at the `secondary` fill, below 3:1; labels identify fields; the focus outline passes 3:1 | Same choice as shadcn and most design systems; report as `LOW` at most |
| Focus indicator | Any visible ring with 3:1; `better-accessibility` prefers a 2px indicator | 2px `outline-ring` offset 2px; text fields a 1px `ring` line (a ring offset) plus a 3px `ring/20` halo, with a transparent outline for forced colors | Survives forced colors and leaves shadow stacks intact. On a field the 1px `ring` line passes 3:1 against the page and the halo widens it; report a field finding as `LOW` at most |
| Focus color | `better-accessibility`: a solid, saturated focus color | `ring`: ink at 55% in the default (3.8:1 or more in light, 5.2:1 or more in dark on every surface), the accent in a preset that has one | Black and white keeps color for status (ADR 0009). The 2px offset leaves a page-color gap, so the outline reads around an ink button too; report as `Kosmos style` |
| Chart series | `dataviz`: categorical series need distinct hues | A mono ramp, ink then four greys, each 3:1 or more on `card` and `background`; touching segments split by a 1px line in the surface color; every series named in the legend and tooltip | Color stays for meaning (ADR 0009); lightness steps read in grayscale and for color-blind readers. A preset may bring hues |

## Accessibility floor

The studied products go below the contrast floor in places. Kosmos keeps their structure and stops at the floor: 4.5:1 for text, 3:1 for large text and for non-text UI.

| Point | Studied value | Kosmos value (wins) | Why |
| --- | --- | --- | --- |
| A third, fainter grey for meta, counts, placeholders and table headers | Light about 2.6:1 on white; dark about 3:1 | `muted-foreground` (5.0–5.8:1 light, 5.5–6.9:1 dark) | Text floor. Light `muted-foreground` already sits near 4.5:1, so no fainter text role fits between it and the floor |
| Sidebar group labels | Dark about 1.9:1 | `muted-foreground`, uppercase caption | Same floor; the uppercase eyebrow keeps the label quieter than the items through size and case, not contrast |
| Idle nav items | Dark grey near 4.6:1 | `muted-foreground` | Same structure (idle grey, active ink), at our own token |
| Placeholders | Light about 2.6:1 | `muted-foreground` | Placeholder text is read as an example of the value and must pass 4.5:1 |
| Tag text | Light-on-tint tags pass in dark; colored status text in some products | `tint-*-foreground` steps (4.5:1 or more on every fill); status text stays neutral with a dot | Tags carry a category by hue; status keeps the dot so its meaning never rides on color alone |
| Field edge | About 1.2:1 ring, no drop | `shadow-field` in `input`, about 1.2:1 | Matches the existing Input boundary row: the label identifies the field and the focus outline passes 3:1 |

## Review output

Findings use one format: a table of `Severity | Location | Before | After | Why`, then `Block` or `Approve`. Rows that match this file are listed under `Kosmos style` and never block.
