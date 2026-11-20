# Audit: Kosmos UI

Status: open
Date: 2026-11-20

The findings of tickets 03 to 06 (`docs/work/audit-spec.md`). `better-interface` reviewed each part; the site check measured it. Each section ranks its own findings; ticket 07 merges shared causes and turns them into fix tickets.

## Triage

Ticket 07 merged the findings by cause into tickets 15 to 31 in `docs/work/tickets/`. Below, C, B, D and L name the four sections (Components, Blocks and dashboards, Docs site, Landing and Presets) and the number is the finding's number in that section. The tickets name findings in full ("Blocks 10").

### Tickets

| Ticket | Title | Findings | Blocked by | Touches |
| --- | --- | --- | --- | --- |
| 15 | Site check fixes | `--route /`, resting shadows, `/preset-preview` (L Verification, D5) | None | site check |
| 16 | Site check: clipped text, unnamed controls and focus under the edge fade | checks for B3, B14, L8, C8, B4, D3 (Fixed in ticket 16) | 15 | site check |
| 17 | Third-party notice check | ADR 0010 check left out of ticket 12 (Fixed in ticket 17) | None | registry item `meta`, `building.md` |
| 18 | Focus stays in view inside scroll areas | C9, B10, L5, D3, B22, D5 | 16 | ScrollArea, Sidebar (resize handle), docs sidebar |
| 19 | Text contrast below the floor | C1, C2, B5, L11 | None | Chart, Badge, Banner, tints test, Logo marquee, lint |
| 20 | Text that fits: components and docs | C3, C4, C5, C17, D1 | None | Model select, Panel, Status, Sidebar (labels), Chart and the charts, Command, Data table, Announcement, Input group, Stat card, copy swatch, lint |
| 21 | Text that fits: blocks | B1, B2, B3, B14, B27 (`dt` height) | 16, 20 | dashboards, Usage and Stats overview, Navbar, Members, Kanban, Feature rows, Feature section, Bento, Testimonials, Detail drawer, app sidebar previews, lint |
| 22 | Pinned overlays in previews | C13, B9, L4, L8 | 15 | `OverlayStage`, previews (Breadcrumb, Dropdown menu, App sidebar, Page header, Detail drawer, Navbar), preset cards |
| 23 | Timing and reduced motion | C6, C11, C12, D13 | None | Notification inbox (dot), Sonner demo, Flickering grid, block viewer, lint |
| 24 | Names and announcements | C7, C8, B4, B12 (Run timeline), B15, B23 | 16 | Notification inbox, Command, Select, Popover examples, Settings, Run timeline, dashboards, Detail drawer, Auth forms, lint |
| 25 | Pointer and keyboard paths | C10, C14, B6, B27 (Kanban radius) | None | Data table, Daily stacked bar chart, Flow chart, Kanban |
| 26 | Block controls keep focus and do what they say | B8, B12, B17, B27 (current item, shortcut, locale, row heights) | None | Navbar, dashboards, Settings, Members, App sidebar, App sidebar demo, 500 example, lint |
| 27 | Status, change, charts and ranges in blocks | B7, B11, B18, B19, B20, B26 ("vs."), B27 (budget meter, eyebrow) | None | Analytics dashboard, Usage and Stats overview, Feature section, Command menu, Detail drawer, Bento, page header demo, `demo-world.md`, lint |
| 28 | Showcase and hero pictures | B13, B21, L7, L13, L14, B27 (landmark, headings, page titles, HeroProduct props) | 16 | Showcase, HeroProduct, App sidebar (`navLabel`), landing showcase and hero, app sidebar previews, lint |
| 29 | Preset styles and the Presets page | L1, L2, L3, L6, L10, L12, L15 | 15 | Iris and Night styles, preset test, Presets page, landing CTAs, lint |
| 30 | Docs site fixes | D2 and B24, D4, D6, D7, D8, D9 (changelog), D10, D11, D12 | None | docs shell, preview frame, not-found page, search dialog, lint |
| 31 | Block copy and docs prose | B25 (`toLowerCase`), B26, B27 (demo world), D15 | None | dashboards, Page header, Command menu, App sidebar, Bento, Kanban, Members, Settings, Hero, `demo-world.md`, `content/docs`, Vale |

Tickets 08 and 09 wait for 15, 16 and 18 to 31. Ticket 17 adds a check only and blocks nothing.

### Run order

Tickets run two at a time; two that touch the same files never run together. The dashboards are touched by 21, 24, 26, 27 and 31, so those run one at a time. The lint files (`eslint.config.mjs`, `lib/code-checks.test.mts`) and the style skill's line for each check are shared by every ticket marked "lint": each adds its own entries, and a merge conflict there is solved by keeping both sides, so it does not keep two tickets apart.

Pairs that share no file, in an order that respects every blocker: 15 and 17; 16 and 19; 18 and 23; 20 and 22; 21 and 29; 24 and 25; 26 and 30; 27 and 28; then 31 alone.

### Finding to ticket

| Section | Finding: ticket |
| --- | --- |
| Components | 1: 19 · 2: 19 · 3: 20 · 4: 20 · 5: 20 · 6: 23 · 7: 24 · 8: 24 · 9: 18 · 10: 25 · 11: 23 · 12: 23 · 13: 22 · 14: 25 · 15: not doing · 16: not doing · 17: 20 |
| Blocks | 1: 21 · 2: 21 (its Panel and Sidebar causes: 20) · 3: 21 · 4: 24 · 5: 19 · 6: 25 · 7: 27 · 8: 26 · 9: 22 · 10: 18 · 11: 27 · 12: 26 (Run timeline: 24) · 13: 28 · 14: 21 · 15: 24 · 16: not doing · 17: 26 · 18: 27 · 19: 27 · 20: 27 · 21: 28 · 22: 18 · 23: 24 · 24: 30 · 25: not doing (`toLowerCase`: 31) · 26: 31 ("vs." wording: 27) · 27: split, below |
| Blocks 27 | `dt` height: 21 · `aria-keyshortcuts`: 26 · duplicate landmark: 28 · heading levels: showcase 28, the rest not doing · wrong current item: 26 · app page title size: 28 · mixed heights: 26 · Kanban radius: 25 · drawer eyebrow: 27 · HeroProduct props: 28 · budget meter: 27 · Usage overview error state, New item dialog on Escape: not doing · demo world: 31 · `NumberField` locale: 26 · copied code: not doing |
| Docs site | 1: 20 · 2: 30 · 3: 18 (check: 16) · 4: 30 · 5: 18 (check: 15) · 6: 30 · 7: 30 · 8: 30 · 9: 30 (changelog item; naming not doing) · 10: 30 · 11: 30 · 12: 30 · 13: 23 · 14: Kosmos style · 15: 31 |
| Landing and Presets | 1: 29 · 2: 29 · 3: 29 · 4: 22 · 5: 18 · 6: 29 · 7: 28 · 8: 22 · 9: not doing · 10: 29 · 11: 19 · 12: 29 · 13: 28 · 14: 28 · 15: 29 · site check tool note: 15 |

### Not doing

Each is marked in its section with the same reason.

- **C15, Gauge in `accent-text`.** Code and rule disagree, and both fixes (add Gauge to the rule, or move the arc to `primary`) are a preference the style skill does not settle. The maintainer picks one.
- **C16 and B25 (all but the Page header's `toLowerCase`), translation.** Kosmos ships English copy and the style skill sets no translation rule; the English plurals are correct. Label props on every component and an `Intl.PluralRules` helper are an API decision for the maintainer.
- **B16, destructive actions with no confirmation in the block.** Taste the style skill does not settle. The blocks hand the action to the app (`onAction`), and their JSDoc and docs ask the app to confirm.
- **B27, `headingLevel` props on ErrorPage, RunTimeline, Footer, Kanban and Members, and Members' repeated "Members".** An API addition and a wording preference the style skill does not settle; their default levels are valid on the pages the docs show. The Showcase's real skip is fixed in 28.
- **B27, Usage overview error state and New item dialog keeping typed text on Escape.** Product behavior the style skill does not settle.
- **B27, copied code in the two dashboards.** Code structure, out of scope (spec, Out of Scope).
- **D9, "Overview" against "About".** Which name is a preference only. The changelog item is fixed in 30.
- **D14, code block warm ink and fixed hues.** The maintainer keeps them: Kosmos style.
- **L9, Iris idle sidebar icons at 2.94:1.** The icons sit beside text labels, so no floor asks for 3:1, and the fix would change a preset palette value.

Also Kosmos style after triage: the unticked Checkbox, Radio, Switch and Slider edges (the maintainer keeps them), and the review's 75-character line in D4 (ticket 30 applies the Kosmos measure, `40em`).

## Components

Ticket 03. `better-interface` review (with `better-accessibility`, `better-layout`, `better-writing`, `better-typography`, `better-colors`, `better-ui`), `kosmos-style` winning every conflict. Read-only: no repo file changed.

### Scope and coverage

- **Scope:** the 79 UI items in `registry/kosmos/ui/` that have a review preview (every `registry:ui` item; none lacks one), their review previews (`/view/<item>`), the 261 docs examples their docs pages embed (`/view/<example>`, from `content/docs/components/*.mdx` and `content/docs/charts/*.mdx`), and those 81 docs pages for page-level overflow and console errors. Default preset only.
- **Stack:** Next.js 16, React 19, Tailwind 4, Base UI 1.9, Recharts 3, Fumadocs. Project docs read: `AGENTS.md`, `GLOSSARY.md`, `kosmos-style` (SKILL.md, `conflicts.md`, `building.md`), the audit spec, the October audit (`.scratch/audit/report.md`), `.scratch/decisions-black-and-white.md`.
- **Runtime evidence** (no screenshots), against the dev server on port 3010:
  - `pnpm site-check --port 3010 --workers 1 --route /view/<each of the 79 items>`: overflow, clipped focus ring, console; light and dark, 375 and 1280 (316 page loads, 34 findings).
  - `pnpm site-check --port 3010 --workers 1 --route /docs/components --route /docs/charts --check overflow --check console --width 375`: the 81 docs pages, light and dark (162 page loads, 0 findings).
  - A scratch measuring script (`scratchpad/audit-run/03-measure.mts`, built on `scripts/site.mts`'s `openSitePage`): for each page, every visible text node's rendered contrast against its composited background (alpha and ancestor opacity included, disabled controls skipped), placeholder contrast, pointer targets under 24px that fail the WCAG 2.5.8 spacing test, text cut by a non-scrolling `overflow` ancestor, controls with no accessible name (from Playwright's ARIA snapshot), a Tab walk that checks each stop shows a focus change, page overflow and console errors. Item previews ran in light 375 and dark 1280 (158 loads); the 261 docs examples in dark 375 (one load each; light and 1280 for the examples rest on the item previews, which hold every variant and state). Reduced motion on (the site helper's default).
  - `pnpm exec eslint registry/kosmos/ui registry/kosmos/examples content/docs/components content/docs/charts`: clean.
  - Code read for every style-skill detection lint cannot judge (overflow, focus, motion gates, `text-base`, shadow without `border-transparent`, `accent-text` use, truncation, live regions, roles).
- **Left out:** the preset passes (Soft, Console, Night, Iris) belong to ticket 06; the docs site shell (docs sidebar, header, page chrome, code themes) to ticket 05; blocks (`app-sidebar`, `data-table` blocks, `run-timeline`…) to ticket 04. 200% zoom and RTL were not walked in a browser (**Not verified**). Screen-reader output was read from the ARIA snapshot, not from a real screen reader (**Not verified** with VoiceOver/NVDA). Pointer-only checks (hover-only states, drag) were read from code.

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | ARIA snapshot and Tab walk on 340 pages; focus-ring site check; live regions, roles, timers and keyboard code in every item | 9 findings (6–14) |
| Layout | Overflow at 375 on 340 pages and 81 docs pages; clipped text; truncation sites in code | 3 findings (3, 4, 17) |
| Writing | Copy in components and examples (errors, confirmations, plurals, labels) | 1 finding (16) |
| Typography | Type roles, `tabular-nums`, truncation of numbers, `text-base` outside inputs, from code | 1 finding (5) |
| Colors | Rendered contrast on 340 pages, light and dark; tint pairs against `lib/tints.test.mts`; `accent-text` use | 3 findings (1, 2, 15) |
| UI | Transitions (named properties, no `transition-all`), shadows with `border-transparent`, radius, press scale, from code | Clear (the motion-gate miss is finding 6, owned by Accessibility) |

**Count:** 17 findings: 6 HIGH, 7 MEDIUM, 4 LOW; 15 bug, 2 taste; 4 Kosmos-style rows, not fixed.

### Findings

Ranked by severity, then by reach. **Kind** is **bug** or **taste**. **Checkable** names the kind of check that would catch it again.

#### 1. Chart axis labels ignore the token: Recharts 3 ticks render `#666`, 3.0:1 in dark (Fixed in ticket 19)

- **Severity:** HIGH (text contrast fails). **Kind:** bug. **Checkable:** yes, browser (computed `fill` of `.recharts-cartesian-axis-tick-value` equals `muted-foreground`), or code (a test that the `ChartContainer` selector names a class Recharts renders).
- **Location:** `registry/kosmos/ui/chart.tsx:71` (`'[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground'`). Shows in every chart that keeps Recharts' own tick: `examples/chart.tsx:134-135`, `examples/chart-custom.tsx:31-32`, `examples/chart-card.tsx:99-100`, `examples/chart-card-legend.tsx:42-43`, and the `usage-overview` block (`blocks/usage-overview/usage-overview.tsx:369-370`).
- **What is wrong:** Recharts 3 draws tick labels in a separate layer, `g.recharts-cartesian-axis-tick-label > text.recharts-cartesian-axis-tick-value`, so the selector `.recharts-cartesian-axis-tick text` matches nothing and the labels keep Recharts' `fill="#666"`. Measured, dark: `/view/chart` "Q1" and `/view/chart-card` "Sep 14" at **3.00:1** on the card, and in the docs examples `/view/chart-card-legend` 3.00:1 and `/view/chart-custom` 3.21:1 (needs 4.5:1). In light `#666` passes (5.7:1) but is not `muted-foreground` and will not follow a preset.
- **Why it matters:** 12px axis labels are the only scale a reader has; in dark they fall below the text floor in every chart built on `ChartContainer` with default ticks.
- **Fix:** point the selector at the class Recharts 3 renders: `[&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground` (and check the other `.recharts-*` selectors on lines 72-78 against Recharts 3's markup the same way).

#### 2. Hover fills on tints drop the tint text below 4.5:1 (hue Badge links, Banner action) (Fixed in ticket 19)

- **Severity:** HIGH (control text contrast fails). **Kind:** bug. **Checkable:** yes, code: add the pair `tint-*-foreground` on `tint-*-border` (and on `tint-*` under the `accent` overlay) to `lib/tints.test.mts`.
- **Location:** `registry/kosmos/ui/badge.tsx:26-31` (`[a&]:hover:bg-tint-*-border`); `registry/kosmos/ui/banner.tsx:74-75` (`BannerAction`: ghost Button with `text-inherit`, hover `bg-accent` over the tint).
- **What is wrong:** a hue Badge rendered as a link swaps its fill to the `-border` step on hover, and its text stays `tint-*-foreground`. Measured in `/view/badge` (hover state): light 3.57–4.08:1 (200 green 3.57, Pro blue 3.76, 500 red 3.75, Trial amber 3.92, Scale violet 4.08); dark 2.77–3.79:1 (500 red 2.77, Pro blue 3.10). The Banner action in a destructive banner, hovered, dark: "Update card" **4.16:1**. `lib/tints.test.mts:26-31` checks the tint text on its fill only, so neither pair is tested.
- **Why it matters:** the label of a control the pointer is on becomes the hardest text on the page to read.
- **Fix:** keep the fill and mark hover another way the tint already supports (underline the badge link, as the Kosmos link-in-alert rule does), or give the hover a fill that keeps 4.5:1 and add that pair to the tint test. For the Banner action, keep the ghost hover off the tint (`hover:bg-tint-*-border` with a passing pair, or the underline).

#### 3. Model select's hidden labels widen the page by 223px at 375

- **Severity:** HIGH (page scrolls sideways at phone width). **Kind:** bug. **Checkable:** yes, browser (the site check's overflow check already fails on `/view/model-select`).
- **Location:** `registry/kosmos/ui/model-select.tsx:66-75` (`sr-only` spans inside a `truncate` span inside the trigger Button); root cause shared with `registry/kosmos/ui/button.tsx:35` (the Button base is not `relative`).
- **What is wrong:** `sr-only` is `position: absolute`. With no positioned ancestor, the spans escape the truncated label and the Button and land at their static position, past the viewport: `/view/model-select` scrolls **223px** sideways at 375 (light and dark) and **117px** at 1280. The docs examples (`model-select-*`) do not overflow: their model names are short, and the preview's long-name case is what pushes the spans out. Re-check of the 01 run: still broken.
- **Why it matters:** the whole page pans sideways on a phone; the same will happen in any app that puts a long model name in a narrow composer toolbar.
- **Fix:** `relative` on the trigger (`ModelSelectButton`'s class list), as `sidebar.tsx:752` and `scroll-area.tsx:63` already do for the same reason. Consider `relative` on the Button base so every `sr-only` label inside a Button stays clipped.

#### 4. Truncated text with no way to the full value

- **Severity:** HIGH (escalation trigger: truncated content with no way back). **Kind:** bug (the Kosmos rule itself requires a way back). **Checkable:** yes, code: flag `truncate` / `line-clamp-*` on an element with no `title` in `registry/kosmos/ui` (allowlist the slots that have a detail view).
- **Locations (no `title`, tooltip or detail view):** `panel.tsx:45` (PanelTitle), `panel.tsx:55` (PanelDescription), `status.tsx:72` (StatusDot label), `status.tsx:99` (StatusBadge label), `sidebar.tsx:695` (group label), `sidebar.tsx:757` (menu item label while expanded; the tooltip shows only in icon mode), `sidebar.tsx:988` (submenu popover label), `chart.tsx:166` (tooltip series name), `multi-line-chart.tsx:214`, `:511`, `:652`, `compare-area-chart.tsx:85`, `:89`, `:94`, `highlight-bar-chart.tsx:153`, `segmented-gauge.tsx:208`, `:225`, `command.tsx:214` (item description), `data-table.tsx:237` (filter summary), `announcement.tsx:37` (tag), `input-group.tsx:74` (addon text).
- **What is wrong:** the style says "Truncated text stays readable in full somewhere: a `title`, a tooltip or the detail view." These slots cut the text with an ellipsis and offer none. Files that do it right: `bar-list.tsx:116`, `combobox.tsx:120`, `donut-chart.tsx:253`, `flow-chart.tsx:403`, `sidebar.tsx:1061`.
- **Why it matters:** a long project, status or series name is lost for good; with real data (ticket 08's worst case) the panel title and the legend are the first to go.
- **Fix:** add `title={…}` where the child is a string (the Kosmos minimum), or let slots that name something wrap: `line-clamp-2` on PanelTitle and PanelDescription, wrap legend names. See the Kosmos-style entry on `title` for why a tooltip or wrap is better than `title` alone.

#### 5. A stat value truncates the number

- **Severity:** HIGH (truncated value, misleads). **Kind:** bug (breaks "Numbers, amounts and dates never truncate; they take `shrink-0`"). **Checkable:** yes, code: `truncate` together with `tabular-nums` on one element.
- **Location:** `registry/kosmos/ui/stat-card.tsx:108` (`'block truncate text-display text-foreground tabular-nums'`).
- **What is wrong:** a value wider than the card shows as "$14,62…", a different number with no way back.
- **Why it matters:** the one figure the tile exists for can read as another value.
- **Fix:** drop `truncate`; let the value shrink the label beside it instead (`shrink-0` on the value, `min-w-0` on its sibling), or step the value down a role (`@3xs:text-display text-title`) by container width.

#### 6. The unread dot scales under reduced motion (Fixed in ticket 23)

- **Severity:** HIGH (escalation trigger: motion that ignores reduced motion; the style calls a missing gate a blocking bug). Its reach is one 8px dot, so it is the cheapest HIGH here. **Kind:** bug. **Checkable:** yes, code: a `scale-*` utility outside `motion-safe:` in a class list whose `transition-[…]` names `scale` (the press scale excepted).
- **Location:** `registry/kosmos/ui/notification-inbox.tsx:497-501` (`transition-[opacity,scale]` with `!unread && 'scale-50 opacity-0'`).
- **What is wrong:** marking a notification read shrinks the dot to half size whether or not the reader asked for reduced motion.
- **Fix:** `motion-safe:scale-50` in place of `scale-50`; the opacity fade stays.

#### 7. The new-items pill announces through a live region mounted with its text (Fixed in ticket 24)

- **Severity:** MEDIUM. **Kind:** bug. **Checkable:** yes, code: a `role="status"` element rendered behind a condition (`count === 0 ? null : <div role="status">`).
- **Location:** `registry/kosmos/ui/notification-inbox.tsx:316-334` (`NotificationInboxNewItems`: `if (count === 0) return null;` then `<div role="status">`).
- **What is wrong:** the live region is created together with its text "3 new", and it wraps a Button. Screen readers announce changes to a region that already exists; a region inserted with its content is often not announced at all.
- **Why it matters:** screen-reader users are not told that new notifications arrived while the inbox is open.
- **Fix:** render an always-present `sr-only` `role="status"` span in the inbox that holds "`${count}` new notifications" (empty at 0), and render the pill Button outside it. The rest of the kit already does this (`copy-field.tsx:85`, `reasoning.tsx:134`, `chart-card.tsx:158`).

#### 8. Popups without an accessible name (Command list, Select list, untitled Popovers) (Fixed in ticket 24)

- **Severity:** MEDIUM. **Kind:** bug. **Checkable:** yes, browser (ARIA snapshot: a `listbox` or `dialog` with no name).
- **Location:** `registry/kosmos/ui/command.tsx:141-153` (`CommandList`, Base UI `Autocomplete.List`); `registry/kosmos/ui/select.tsx:95` (`SelectPrimitive.List` when the trigger is named with `aria-label`, as in `examples/select.tsx:51`, `:81`, `:94`); Popovers with a description and no title in the docs examples and preview: `examples/popover-hover.tsx:17-21`, `examples/popover-side.tsx:12-14`, `examples/model-select-search.tsx:60`, `examples/popover.tsx:107-117`.
- **What is wrong:** measured on `/view/command` (5 lists), the docs examples `command-inline`, `command-loading` and `command-pages`, `/view/select` (the open list) and `/view/popover` (the "About this metric" popover): `- listbox:` and `- dialog:` with no name, light and dark. ARIA requires a name on `listbox` and `dialog`. `popover.mdx:60` asks for an `aria-label` on the trigger but not on the popup.
- **Why it matters:** a screen reader announces "list box" or "dialog" with no context when focus enters it.
- **Fix:** `CommandList` takes an `aria-label` (default "Commands", or `aria-labelledby` the input); `SelectContent` passes `aria-labelledby` the trigger when no `SelectLabel` or Field label names it; a Popover without a `PopoverTitle` takes `aria-label` on `PopoverContent`, and the docs say so beside `openOnHover`.

#### 9. Wide tables leave the focused control mostly hidden past the scroll edge

- **Severity:** MEDIUM. **Kind:** bug. **Checkable:** yes, browser (the site check's focus-ring check already reports it: `/view/table` "Open" cut 43px, `/view/data-table` "MRR" 2–17px and "Status" 23–25px, light and dark, 375 and 1280).
- **Location:** `registry/kosmos/ui/scroll-area.tsx:57-64` (the viewport that scrolls a `Table`, `table.tsx:13`, and `DataTableContent`).
- **What is wrong:** Chrome does not scroll a focused element that is already partly visible. Measured on `/view/table` at 375: the "Open" button sits at x 339–390 in a viewport ending at 351; after Tab, `scrollLeft` stays 0, so 39 of its 51px stay hidden and its focus ring is cut. `scrollIntoView({ inline: 'nearest' })` on the same button scrolls by 43px, so the room is there.
- **Why it matters:** keyboard users reach row actions and sortable headers they cannot see; the ring that should show where they are is cut off.
- **Fix:** in `ScrollArea`, on `focusin` inside the viewport, call `target.scrollIntoView({ block: 'nearest', inline: 'nearest' })` (the `scroll-p-1` padding then keeps the ring clear). One fix covers tables, tab lists and every other scroller.

#### 10. Data table rows open on click only

- **Severity:** MEDIUM. **Kind:** bug (API invites a pointer-only path). **Checkable:** no (needs judgment per caller).
- **Location:** `registry/kosmos/ui/data-table.tsx:529`, `:551-553`, `:598` (`onRowClick` on the `<tr>`); `content/docs/components/data-table.mdx:67`, `:125`.
- **What is wrong:** `onRowClick` puts a click handler on the row with no keyboard equivalent, and neither the JSDoc nor the docs say a row also needs a focusable link or button that does the same. The projects table block adds one (`blocks/projects-table/projects-table.tsx:250-254`), so the shipped block is fine; an app following the docs is not.
- **Why it matters:** a keyboard or switch user cannot open a row in an app that relies on `onRowClick` alone.
- **Fix:** say in the prop's JSDoc and the docs that `onRowClick` is a pointer shortcut and the row's name cell must hold a link or button that opens the same thing; show it in the docs example.

#### 11. The Sonner docs hero teaches an Undo toast that disappears after 4 seconds (Fixed in ticket 23)

- **Severity:** MEDIUM. **Kind:** bug (WCAG 2.2.1; the docs' own rule). **Checkable:** yes, code: a Sonner `toast(…, { action })` with no `duration: Infinity`, or a Base UI `toast.add` with `actionProps` and no `timeout: 0`.
- **Location:** `registry/kosmos/examples/sonner-demo.tsx:13-16` (`action: { label: 'Undo' }`, default duration), the hero of `content/docs/components/sonner.mdx`.
- **What is wrong:** `sonner.mdx:62` and `toast.mdx:65` say a toast with an action stays until closed; the hero example of Sonner does the opposite.
- **Why it matters:** people copy the hero; slow readers and screen-reader users lose the Undo before they reach it.
- **Fix:** `duration: Infinity` on the demo toast (the Toast demo and both `-action` examples already follow the rule).

#### 12. Flickering grid flickers forever with no way to pause it (Fixed in ticket 23)

- **Severity:** MEDIUM. **Kind:** bug (WCAG 2.2.2). **Checkable:** no.
- **Location:** `registry/kosmos/ui/flickering-grid.tsx:156-162` (the `requestAnimationFrame` loop; stops only under reduced motion, off screen or in a hidden tab).
- **What is wrong:** blinking content that runs past 5 seconds beside other content needs a pause. Only the reduced-motion setting stops it; the Logo marquee got a Pause/Play button for the same criterion (decisions, 09.1).
- **Why it matters:** flicker in the reader's peripheral vision distracts people with attention and vestibular conditions who have not turned on reduced motion.
- **Fix:** let the flicker settle to the still pattern after a few seconds (the code already has `stillOpacity`), or add a `paused` prop and a pause control in the docs example.

#### 13. Two pinned-open menus in a review preview crash focus with infinite recursion (Fixed in ticket 22)

- **Severity:** MEDIUM. **Kind:** bug (review tooling; it also cuts short the site check's Tab walk on those pages). **Checkable:** yes, browser (the site check's console check reports it on every run).
- **Location:** `registry/kosmos/examples/breadcrumb.tsx:126`, `:145` and `registry/kosmos/examples/dropdown-menu.tsx:60`, `:85`, `:128` (menus rendered `open modal={false}` side by side in `OverlayStage`s). The 01 run also saw it on the `app-sidebar`, `detail-drawer` and `page-header` previews (ticket 04).
- **What is wrong:** tabbing on `/view/breadcrumb` and `/view/dropdown-menu` throws "Maximum call stack size exceeded" (17 times in one walk; light and dark, 375 and 1280). The stack ping-pongs between Base UI's `FloatingFocusManager` inside guard and `FloatingPortal` outside guard `onFocus` handlers. Re-check of the 01 run: still broken, not a dev-server artifact. The site check's focus-ring check also reports a 1px focus guard `span` on `/view/dropdown-menu`, from the same loop.
- **Why it matters:** keyboard review of those previews is impossible, and the browser check stops measuring focus there.
- **Fix:** first reduce it to a minimal repro (likely two Base UI menus held `open modal={false}` on one page, each with its portal focus guards). Then either keep pinned popups out of the tab order in previews (`inert` on each `OverlayStage` that is not under review) or pin one non-modal menu per page, and report the guard loop to Base UI if it reproduces outside the preview.

#### 14. Charts give pointer targets narrower than 24px

- **Severity:** LOW. **Kind:** bug (WCAG 2.5.8). **Checkable:** yes, browser (target size with the spacing test).
- **Location:** `registry/kosmos/ui/daily-stacked-bar-chart.tsx` (one Button per day: 10–18px wide at 375, 15px at 1280 with 30 days); `registry/kosmos/ui/flow-chart.tsx:647` (band value labels, 17–25 × 20px).
- **What is wrong:** each day column is its own pointer target, as narrow as the bar slot; neighbours sit closer than the 24px spacing allows.
- **Why it matters:** on a phone a tap lands on the wrong day; the arrow keys are fine.
- **Fix:** track the pointer over the whole plot and light the nearest day (as `multi-line-chart` does), keeping the per-day Buttons for keyboard only; give band labels an `after:-inset-*` hit area.

#### 15. Gauge colors its primary arc with `accent-text`, which the style reserves for navigation and the Meter

- **Severity:** LOW. **Kind:** taste (code and rule disagree). **Checkable:** yes, code: an allowlist of files that may use `accent-text`.
- **Location:** `registry/kosmos/ui/gauge.tsx:12`, `:128`; rule in `.claude/skills/kosmos-style/SKILL.md`, Current page in navigation ("accent-text fills only the Meter's primary tone and tints Glow and Flickering grid").
- **Why it matters:** under a preset with an accent, the Gauge takes the accent hue while the rule tells agents it never does, so the next agent either breaks Gauge or the rule.
- **Fix:** add Gauge (the Meter's sibling) to the rule, or move the arc to `primary`. The maintainer decides which.
- **Triage:** not doing. Both fixes are a preference the style skill does not settle; the maintainer picks one.

#### 16. Components build English sentences with English-only plurals

- **Severity:** LOW. **Kind:** taste. **Checkable:** yes, code (`n === 1 ?` beside a string).
- **Location:** `registry/kosmos/ui/data-table.tsx:127` (`countOf`), `tags-input.tsx:61`, `assistant-message.tsx:76`, `breadcrumb.tsx:142`; fixed strings such as `dialog.tsx:101` ("Close"), `command.tsx:125` ("Search commands"), and the Load more strings in Pagination (decisions, 19.1).
- **What is wrong:** strings are assembled around a number with `=== 1` plurals and most cannot be replaced through props, so a non-English app cannot translate them.
- **Why it matters:** many languages have more than two plural forms and another word order; an app in another language ships English inside its own UI.
- **Fix:** take label props (as Calendar's `previousMonthLabel` does) and use `Intl.PluralRules` where a count is spoken.
- **Triage:** not doing. Kosmos ships English copy and the style skill sets no translation rule; label props on every component are an API decision for the maintainer.

#### 17. Donut chart preview's controls overflow at 375

- **Severity:** LOW (review preview only). **Kind:** bug. **Checkable:** yes, browser (site check, overflow: `/view/donut-chart` 9px, light and dark).
- **Location:** `registry/kosmos/examples/donut-chart.tsx:150` (`<div className="flex gap-2">` with two Buttons).
- **What is wrong:** the two shift Buttons sit in a row that cannot wrap, 9px wider than the 375 viewport.
- **Why it matters:** the review preview scrolls sideways, so the site check fails on it and hides real overflow behind a known one.
- **Fix:** `flex flex-wrap gap-2`.

### Kosmos style

Findings the review skills raise that a Kosmos value settles. Listed, not fixed.

| Review says | Kosmos value | Locations | Note |
| --- | --- | --- | --- |
| A text field's boundary needs 3:1 (WCAG 1.4.11); `shadow-field` is a 1px `input` ring, about 1.2:1 in light | `conflicts.md`, Input boundary: LOW at most | `input.tsx`, `textarea.tsx`, `select.tsx`, `number-field.tsx`, `input-group.tsx`, `combobox.tsx`, `otp-field.tsx`, `date-picker.tsx` | As documented |
| An unticked Checkbox or Radio, a Switch that is off and a Slider track are identified by their edge; `shadow-control` (foreground at 10%) is about 1.2:1 on the light page and about 1.1–1.3:1 in dark; the off Switch track (`bg-muted` + `shadow-inset`) is about 1.1:1 | SKILL.md, Surfaces table (`shadow-control`, `shadow-inset`) | `checkbox.tsx:19`, `radio-group.tsx:35`, `switch.tsx:17`, `slider.tsx:63`, `segmented-control.tsx:95` | Not in `conflicts.md`: the Input boundary row covers fields only. Triage: the maintainer keeps the edges as they are |
| A `title` is no way back for truncated text: it shows on mouse hover only, never on keyboard focus or touch | SKILL.md, Phones: "a `title`, a tooltip or the detail view" | `bar-list.tsx:116`, `combobox.tsx:120`, `daily-stacked-bar-chart.tsx:274`, `donut-chart.tsx:253`, `flow-chart.tsx:403`, `:442`, `prompt-composer.tsx:205`, `sidebar.tsx:1061`, `:1065`, `stacked-block-chart.tsx:319`, `tool-call.tsx:107` | Breadcrumb's truncated crumbs already use a hover-and-focus tooltip (`breadcrumb.tsx:166-179`); that is the better pattern |
| Focus color should be a saturated hue | `conflicts.md`, Focus color: ink at 55% | every focus outline | As documented |

### October audit, re-checked in this scope

| October finding | Now |
| --- | --- |
| 1c Collapsible trigger ring cut (`tool-approval`) | Fixed: no focus-ring finding on `/view/tool-approval` (light, dark, 375, 1280). `run-timeline` is ticket 04 |
| 1d Sidebar's last nav item ring cut | Fixed on `/view/sidebar`. The docs sidebar and the `app-sidebar` block (01 run: 134 findings) are tickets 05 and 04 |
| 1f Sidebar resize handle ends cut | Fixed: no finding on `/view/sidebar` |
| 1g Command dialog's `sr-only` close button focusable | Fixed: `command.tsx:106` has `tabIndex={-1}` |
| 2.3b Pagination current page in the accent | Settled: the rule now lists Pagination |
| 2.3c Glow and Flickering grid in the accent | Settled: the rule now lists both |
| 5a Flickering grid docs page scrolls sideways at 375 | Fixed: 0 findings (`--route /docs/components/flickering-grid`, light and dark) |
| 5c Console warning on the Checkbox docs page | Not reproduced: 0 console findings in 4 loads |
| 01 run: `/view/model-select` 223px and `/view/donut-chart` 9px overflow | Still broken: findings 3 and 17 |
| 01 run: "Maximum call stack size exceeded" on `/view/breadcrumb`, `/view/dropdown-menu` | Still broken, real: finding 13 |
| 01 run: `/docs/components/data-table` header ring cut at 375 | Still broken: finding 9 |

### Verification

Passed or clean:
- ESLint on components, examples and component docs: 0 problems.
- No horizontal overflow on any item preview except `model-select` and `donut-chart`; no text cut by a non-scrolling clip; no nameless button, link, input, tab, checkbox, switch, slider or menu item on any of the 340 pages.
- Every animated `translate`, `scale` and `blur` in `registry/kosmos/ui` is behind `motion-safe:` or a reduced-motion check, except the unread dot (finding 6). No `transition-all`, no `h-screen`/`vh`, no `overflow-auto` outside `ScrollArea` but Base UI's Select list (allowed by the Overflow rule), no `text-base` outside an input.

Discarded measurements (false positives, checked by hand):
- Text at opacity 0 in `flow-chart`, `segmented-gauge`, `text-reveal`, `sonner`, `sidebar`: entrances that wait for the chart to scroll into view, toasts behind the front one, and collapsed submenus (`hidden="until-found"`, not focusable).
- "No focus change" on Input, Textarea, Select trigger, Field and OTP inputs: the previews pin their focus state with `data-preview="focus"`, so blur changes nothing.
- `chart` "no data" caption at 2.55:1: the `sr-only` data table.
- `input-group` "https://" at 2.11:1: the disabled row (exempt).
- Combobox chip remove 18px: its `after:-inset-1` hit area makes it 26px.

**Not verified:** 200% zoom and 320px reflow, RTL mirroring, a real screen reader, forced-colors mode, and the presets with a style.

## Blocks and dashboards

Ticket 04. Reviewed with `better-interface` (its six `better-*` domain skills loaded), `kosmos-style` winning every conflict.

### Scope

- **Covered:** all 28 blocks in `registry/kosmos/blocks/`, both dashboards (`dashboard-analytics`, `dashboard-crm`), the showcase, and their review previews and demos in `registry/kosmos/examples/` (`<name>.tsx`, `-demo`, `-thumb`, the navbar variants, `hero-product`, `error-page-500`). Every line of block and example code was read.
- **Measured** on the dev server (port 3010, branch `feature/audit-and-checks`), Default preset, light and dark, 375 and 1280:
  - `pnpm site-check --port 3010 --workers 2 --route /view/<each block>` (112 page loads).
  - Scratchpad scripts, all in `scratchpad/audit-run/`:
    - `measure-blocks.mts`: rendered text contrast against the composited background, clipped text, truncation with no way back, unnamed controls and small targets (112 loads).
    - `clip-probe.mts`: text cut by an overflow ancestor (56 loads).
    - `num-trunc.mts`: numbers cut at 320 to 1024 wide.
    - `tab-trace.mts`, `console-probe.mts` and `hydration-repro.mts`: keyboard walks and console errors.
    - `scroll-probe.mts` and `attr-probe.mts`: focus scrolling and computed names.
    - `tint-contrast.mts`, `hero-probe.mts`, `clamp-probe.mts` and `focus-loss.mts`.
- **Left out:**
  - The insides of shared components the blocks use (DataTable, Sidebar, Panel, ScrollArea, Chart, TagsInput, Drift); they belong to ticket 03. Where a block finding has its cause in one, the finding names it.
  - The preset style pass (ticket 06).
  - The `.registry.json` dependency lists.
  - Screen-reader and real-device checks: VoiceOver on the logo marquee pause button, live-region announcements. These are marked **Not verified**.
  - The `/docs/blocks/*` pages, beyond the two console errors below.
- **Contrast:** no failing text pair in any block preview at rest, in either theme. The one failing pair (finding 5) shows only on hover and focus.

### Console errors in the first site-check run: verdicts

- **"Maximum call stack size exceeded"** on `/view/app-sidebar` (1280), `/view/page-header` and `/view/detail-drawer`. **Real bug, preview only, not a dev artifact.**
  - Those previews pin a menu open with a controlled `open: true` and no `onOpenChange`:
    - `examples/app-sidebar.tsx:34`
    - `examples/page-header.tsx:29`
    - `examples/detail-drawer.tsx:55`
    - `/view/dropdown-menu` and `/view/breadcrumb` (ticket 03 scope)
  - When Tab reaches the menu's focus guard, Base UI's `FloatingFocusManager` inside guard and `FloatingPortal` outside guard hand focus back and forth (`FloatingFocusManager.mjs` / `FloatingPortal.mjs` `onFocus`) until the stack overflows.
  - In `/view/app-sidebar` at 1280, Tab then loops between "Lena Park, user menu" and the guard forever. That is a keyboard trap, and it ended the site check's focus sweep, so the rest of that preview was never measured. Found with `tab-trace.mts`.
  - The same pinning puts a focus stop on an invisible guard span in the navbar mega-menu preview at 375. That is the site check's "span is cut" finding on `/view/navbar`.
  - It is finding 9.
- **Hydration mismatch** on `/docs/blocks/new-item-dialog` and `/docs/blocks/settings`. **Real race in the docs preview frame, not in the blocks.** Intermittent: 3 of 16 loads.
  - `components/docs/preview-frame.tsx:38,43` writes `data-in-frame` and `data-centered` onto the iframe's `[data-preview-root]` div when the iframe `load` event fires. Under load, React has not yet hydrated that div (`app/(view)/view/[name]/page.tsx:33`).
  - Reproduced every time by setting the attribute at `DOMContentLoaded` (`hydration-repro.mts`). The error's diff is `- data-in-frame=""` on that div.
  - It is finding 24. It belongs to docs tooling, so the orchestrator may move it to the docs section.

### October audit, re-checked in this scope

| October item | Now |
| --- | --- |
| 1a Settings "Delete workspace" confirm input ring cut by `DialogBody` | **Fixed** (ticket 02). No finding on `/view/settings`. Dropped. |
| 1b Page header / showcase focusable tab panel cut on three sides | **Fixed.** Not flagged. Dropped. The showcase panel has a new, separate issue: finding 13. |
| 1d Last sidebar nav item ring cut by the scrolling nav | **Not reproduced** on the dashboards or on app-sidebar at 375. At 1280, `/view/app-sidebar` could not be swept because of the keyboard trap in finding 9: **Not verified** there. |
| 1e Navbar mega-menu "Changelog" ring cut | **Fixed.** Not flagged. The remaining navbar finding is the guard span from finding 9. |
| 1f Sidebar resize handle ring cut top and bottom by 2px | **Still present** on both dashboards. Finding 22. |
| 1g Command menu `sr-only` close button with a cut ring | **Not flagged** any more. Dropped. |
| 3 HeroProduct: scrollbar visible in the inert picture; no sidebar trigger at 375 | **Still present in the block.** The landing page hides its own copy of the scrollbar. Finding 21. |
| Writing: `cancelled` | User-facing copy now says "Canceled". The status value `'cancelled'` stays in the `RunStatus` type (`run-timeline.tsx:18`). That is API, not copy, so it is not listed. |

### Findings

Ranked by severity, then by reach. **Checkable** names the kind of check that could catch it next time.

#### HIGH

**1. Numbers truncate, with no way to read them in full.**
- **Bug.** Checkable by a **code** check (`truncate` with `tabular-nums` or `text-display` on one element in `blocks/`) and a **browser** check (ellipsis on numeric text).
- **Where:**
  - `blocks/dashboard-analytics/dashboard-analytics.tsx:393`: Traffic totals, `truncate text-title … tabular-nums`.
  - `blocks/dashboard-crm/dashboard-crm.tsx:572`: stage stats.
  - The `TwoLine` primary line in both dashboards (`dashboard-analytics.tsx:492`, `dashboard-crm.tsx:302`), which carries MRR and deal value.
  - `blocks/usage-overview/usage-overview.tsx:166`: `truncate text-display tabular-nums`.
  - `blocks/stats-overview/stats-overview.tsx:205`.
- **What is wrong:** measured with `num-trunc.mts`:
  - `/view/dashboard-analytics` at 320: "126,400" needs 60px and gets 41px, so it shows "1…". "38,910", "29,800" and "38.2%" are cut too.
  - `/view/usage-overview` at 1024: "$327,681.91" needs 184px and gets 182px.
- **Why it matters:** a cut number misleads, and Kosmos says numbers never truncate (Phones).
- **Fix:**
  - Drop `truncate` from values and give them `shrink-0`.
  - Let the three-column total strips wrap below a container width: `grid-flow-row` under `@sm`.
  - Compact large currency the way `stats-overview`'s `formatValue` already does.

**2. Truncated text with no way back.**
- **Bug.** Checkable by a **browser** check: an ellipsis or line clamp whose element, and whose ancestors, carry no `title`, tooltip or `aria-describedby` (`measure-blocks.mts` already does this).
- **Shared causes:**
  - `ui/panel.tsx:45,55`: PanelTitle and PanelDescription `truncate` with no `title`. Measured: "October target for the Growth and Platform…" in `dashboard-analytics` at 375 and 1280.
  - `ui/sidebar.tsx:757`: the menu button label `[&>span]:truncate` has no tooltip while the sidebar is expanded. Measured: the saved view "Scale plan projects on iOS with more than 10,000 users" in `/view/app-sidebar` at 1280.
- **In the blocks themselves:**
  - `blocks/navbar/navbar.tsx:410`: the banner message is `line-clamp-2`. At 320 it is 83px wide and clamps even the short sample ("Annual billing is live, with two months free.", 73px of text in 36px). At 375 the long sample clamps. The full sentence exists nowhere else. Measured with `clamp-probe.mts`.
  - `navbar.tsx:591`: the brand name ("Acme Product Analytics" at 375).
  - `navbar.tsx:310`: links in the phone sheet.
  - `dashboard-crm.tsx:524-525`: task title and detail at 375.
  - `dashboard-analytics.tsx:583`: activation step.
  - `blocks/members/members.tsx:449`: the invite line "Viewer · Alexandra Konstantinopoulou-Pap…" at 375. It cuts the date too.
  - `blocks/kanban-board/kanban-board.tsx:220-224`: the target quarter (a date) is `truncate`.
  - `usage-overview.tsx:172`: "vs previous period" at 1280.
  - `stats-overview` chart card description at 375.
  - `examples/app-sidebar.tsx:24` and `examples/app-sidebar-demo.tsx`: the page `h1` "Scale plan projects on iOS…" at 375.
- **Why it matters:** a better-interface escalation trigger. The person cannot reach the full value.
- **Fix:**
  - Add `title={text}` beside every `truncate` on text the data supplies, as the table name cells already do. In Panel and the Sidebar, pass the title through.
  - Drop `line-clamp-2` from the banner and put `linkLabel` on its own line below `@sm`.
  - Give dates `shrink-0` and no `truncate`.

**3. Long words and long labels overflow the block at phone width.**
- **Bug.** Checkable by a **browser** check: visible text cut by an ancestor that clips it, in the previews' worst-case sections (`clip-probe.mts`).
- **Where:**
  - `blocks/feature-rows/feature-rows.tsx:186-188`: the row title and description have no `wrap-break-word`. The preview's long event name runs 364px past the block at 375 and 357px at 1280 ("signup_completed_with_a_very_long_event_name_from_the_web_sdk" and its URL).
  - `blocks/feature-section/feature-section.tsx`, action slot: a long Button label ("Read the dashboards guide and every example in it") is cut by 64px at 375. A Button never wraps and the slot lets it grow past the block.
  - Same missing `wrap-break-word` on the section titles in `bento.tsx:270`, `feature-rows.tsx:167`, `feature-section.tsx:214` and `testimonials.tsx:215`. Cta, Faq and ErrorPage have it.
- **Why it matters:** content clipped at 375 is an escalation trigger.
- **Fix:**
  - Add `wrap-break-word` to every heading and description that takes caller text in the marketing blocks.
  - Give the action slot `max-w-full min-w-0`, and let the Button label `truncate` with a `title`, or wrap it with `h-auto whitespace-normal`.

**4. Settings: the API key field has no accessible name (Fixed in ticket 24).**
- **Bug.** Checkable by a **browser** check (axe `label`) or a **code** check (`<CopyField` with no `aria-label` outside a `Field`).
- **Where:** `blocks/settings/settings.tsx:601`, `<CopyField secret label="API key" value={apiKey} />`.
- **What is wrong:** measured with `attr-probe.mts`. The computed role and name are `textbox: ••••••••••••6789`, with no label. CopyField's `label` names only its Show and Copy buttons.
- **Why it matters:** WCAG 4.1.2. A screen reader announces an unnamed read-only field.
- **Fix:** `aria-label="API key"`, or wrap it in `Field` with a `FieldLabel`.

**5. Logo marquee: on hover and focus, the names fail text contrast in dark mode (Fixed in ticket 19).**
- **Bug.** Checkable by a **code** check (a `--tint-*-solid` used as `--logo-color` or as a text color) or a `pnpm test` contrast case.
- **Where:**
  - `blocks/logo-marquee/logo-marquee.tsx:38-44`: the sample `color: 'var(--tint-*-solid)'`.
  - `logo-marquee.tsx:62`: `hover:text-(--logo-color,…) focus-within:text-(--logo-color,…)`.
  - The links preview `examples/logo-marquee.tsx:22-24`.
- **What is wrong:** measured with `tint-contrast.mts`, `--tint-*-solid` against dark `background`: blue 3.02, green 3.43, amber 2.94, red 2.82, violet 2.83. All fail 4.5:1 for the 16px/600 name. Light passes (5.15 to 6.26).
- **Why it matters:** body-size text below the floor in one theme is an escalation trigger, and here it shows on keyboard focus.
- **Fix:** color the mark only (`[&_:is(svg,img)]:text-(--logo-color)`) and keep the name `text-foreground`. Or document that `color` must pass 4.5:1 in both themes and drop the tint-solid samples.

**6. Kanban board: dragging is the only pointer path to move a card.**
- **Bug.** Not checkable.
- **Where:** `blocks/kanban-board/kanban-board.tsx:256-307` (SortableCard) and `:504-511` (Mouse, Touch and Keyboard sensors).
- **What is wrong:** the keyboard path is good (Space, arrows, Space, every move announced). But a pointer user who cannot drag (head pointer, tremor) has no other way, and `onOpen` offers no column change.
- **Why it matters:** WCAG 2.5.7.
- **Fix:** a per-card "Move to…" `DropdownMenu` (`Button variant="item" size="icon-sm"`, `aria-label={`Move ${title}`}`) listing the other columns plus Move up and Move down. Each item calls the same `commit()` and the same announcement.

**7. Dashboard Analytics: presence is shown by color alone.**
- **Bug.** Checkable by a **code** check (a dot whose state is only a `bg-*` with an `sr-only` label).
- **Where:** `blocks/dashboard-analytics/dashboard-analytics.tsx:482-486` (the `presenceDot` map), `:509-513` (the dot) and `:519` (the `sr-only` label).
- **What is wrong:** online, away and offline are a green, amber or grey dot on the avatar. Sighted people get no word and no tooltip. In forced colors all three become `CanvasText`.
- **Why it matters:** an escalation trigger (WCAG 1.4.1), and Kosmos says status never rides on color alone.
- **Fix:** a `title` and a tooltip with `presence.label` on the avatar wrapper, or the word in the second line ("Online · leila@…"). Or drop presence from the signups list, which demo-world does not call for.

#### MEDIUM

**8. Focus drops to `<body>` when the focused control removes or disables itself.**
- **Bug.** Checkable by a **browser** check: activate the control from the keyboard, then assert `document.activeElement !== document.body`.
- **Where:**
  - Navbar banner dismiss: `navbar.tsx:407` (`if (dismissed) return null`) and `:439-446`. **Measured:** focus lands on `BODY`.
  - Dashboard notifications, from code (**not verified at runtime**):
    - "Mark all as read" unmounts itself: `dashboard-analytics.tsx:907`, `dashboard-crm.tsx:867`.
    - The row actions remove their own row: `dashboard-analytics.tsx:953-968`, `dashboard-crm.tsx:913-928`.
  - Settings Save (`settings.tsx:194`, `disabled={!dirty || saving}`), the saving `fieldset disabled` (`:166`) and Discard, which unmounts (`:189-193`). From code; the runtime walk was inconclusive.
  - Members Send invite (`members.tsx:319`).
- **Why it matters:** WCAG 2.4.3. A keyboard user loses their place after every dismiss, save or archive.
- **Fix:**
  - Follow the PageHeader chip pattern (`page-header.tsx:143-157`): focus the next row, else the list or tab.
  - `focusableWhenDisabled` on the Button that disables itself.
  - On dismiss, move focus to the bar's home link.
  - An always-rendered `role="status"` line that says what happened.

**9. Review previews pin menus open with no `onOpenChange`: a keyboard trap and a stack overflow.** (Fixed in ticket 22)
- **Bug, preview only.** Already caught by the **browser** check's console check.
- **Where:**
  - `examples/app-sidebar.tsx:34` (`{ open: true, modal: false }`)
  - `examples/page-header.tsx:29` (`filterMenu={{ open: true, modal: false }}`)
  - `examples/detail-drawer.tsx:55` (`actionsMenu={{ open: true, modal: false }}`)
  - The navbar mega-menu preview at 375.
  - Outside this scope: `/view/dropdown-menu` and `/view/breadcrumb`.
- **What is wrong:** see the verdict above. Tab ping-pongs between Base UI's focus guards: 17 page errors on the first Tab, then 8 on every Tab. In `/view/app-sidebar` at 1280, Tab never leaves the user menu.
- **Why it matters:** the preview is where the site check measures the block. Today the trap hides every focus-ring finding after the menu, and the console check fails on every run.
- **Fix:** pin a menu with an `onOpenChange` that ignores only the `focus-out` and `outside-press` reasons. Or pass `modal={false}` plus `disablePortal`, or `trapFocus={false}` if the menu exposes it. Re-run `pnpm site-check --route /view/app-sidebar` afterwards to measure what the trap hid.

**10. Data table header controls take focus while hidden past the table's scroll edge.**
- **Bug.** Checkable by a **browser** check: the site check flags it as a focus ring cut by `scroll-area-viewport`.
- **Where:** in `/view/dashboard-crm` and `/view/dashboard-analytics` at 375 (both themes), the header sort menus "Stage", "Plan" and "Activation" are cut by 10 to 61px.
- **What is wrong:** measured with `scroll-probe.mts`. Focusing "Stage" leaves it at x 323 to 385 inside a viewport that ends at 328, with `scrollLeft` still 0. Chrome treats a partly visible element as already in view, so the ring and label stay hidden.
- **Cause:** a shared one, the ScrollArea or DataTable.
- **Fix:** in `ui/scroll-area.tsx`, an `onFocus` on the viewport (capture phase) that calls `target.scrollIntoView({ block: 'nearest', inline: 'nearest' })` when the focused element is not fully inside the viewport. One fix covers every table block.

**11. Dashboard Analytics: the header period picker changes only the Traffic panel.**
- **Bug (misleading).** Not checkable.
- **Where:**
  - `dashboard-analytics.tsx:1049-1057`: the DateRangePicker sets `range`.
  - `:734`: `KpiStrip` gets the same `kpis` for every range.
  - `:749,752`: the hard-coded "By visitors, last 30 days".
- **Why it matters:** a picker in the page header reads as a filter for the whole page. Pick "Last 7 days" and the KPIs, Top pages and Countries still show 30 days.
- **Fix:** key `kpis`, `sources`, `topPages` and `countries` by `Range`, as `traffic` already is, and build the descriptions from `ranges[range].label`. Or move the range control into the Traffic panel only.

**12. Controls that do nothing, or report success that did not happen (the Run timeline part: Fixed in ticket 24; the rest: ticket 26).**
- **Bug.** Partly checkable by a **code** check (`onClick={() => {}}` outside `examples/*` preview files, and `clipboard?.writeText` without `await`).
- **Where:**
  - `blocks/app-sidebar/app-sidebar.tsx:262-270`: the Search button always renders with `onClick={onSearch}`, and `examples/app-sidebar-demo.tsx` passes none.
  - `dashboard-crm.tsx:527`: the task buttons (Call, Send, Email, Book, Reply) call `onTaskAction?.()`. They are dead by default.
  - `blocks/run-timeline/run-timeline.tsx:431`: Retry is a no-op without `onRetry`.
  - `run-timeline.tsx:263-267`: Copy link shows "Link copied" with no `url`, no handler, no clipboard, or a refused write. The change is only in the button's `aria-label`, so nothing is announced.
  - `examples/error-page-500.tsx:15`: the docs example's only recovery, "Try again", is `onClick={() => {}}`.
- **Why it matters:** a control that silently does nothing, or lies, misleads.
- **Fix:**
  - Render each action only when its handler or `href` is passed, as these blocks already do for `onAction`, `onNew` and `tasksHref`.
  - Copy link uses `useCopy` (`hooks/use-copy.ts`) and an always-rendered `role="status"`.
  - The 500 example calls `reset()` or `location.reload()`.

**13. Showcase: screens scroll with `overflow-y-auto`, not ScrollArea, so there is no edge fade.**
- **Bug against kosmos-style (Overflow).** Checkable by a **code** check (`overflow-(x|y)-auto` inside a block; it also appears in the style's detection table).
- **Where:** `blocks/showcase/showcase.tsx:119` (`TabsContent … overflow-x-hidden overflow-y-auto`) and `:28` (`SidebarInset … overflow-y-auto`).
- **What is wrong:**
  - Measured: the panel cuts its content at the frame edge with no fade. "Security alerts" is cut by 11px at 1280, and a block 35px at 375.
  - The site check also flags the Settings textarea's ring, cut by 36px at the panel's bottom.
- **Why it matters:** the fade is the Kosmos cue for hidden content. An overlay scrollbar shows nothing until you scroll.
- **Fix:** wrap each screen in `ScrollArea` with a focusable viewport, and keep `-outline-offset-2` on the root.

**14. Feature rows: the stage crops the media's header text at mid widths, and visual order differs from DOM order.**
- **Bug.** Checkable by a **browser** check (text cut by `[feature-rows-item-media]` at 900 wide) and a **code** check (`order-` in a block).
- **Where:** `feature-rows.tsx:200-204` (`overflow-hidden … justify-end`, with media `@3xl:min-w-136`) and `:185` (`flipped && '@3xl:order-2'`).
- **What is wrong:** measured with `clip-probe.mts` at 900 wide:
  - The chart card's "Events" and "A day, last 14 days" are cut by 71px.
  - The Greek sample line and "One short line" are cut by 88px.
- **Fix:** crop only the trailing edge on flipped rows (`justify-start`), or apply `min-w-136` from `@5xl`. Place flipped media with `col-start-*` instead of `order-2`.

**15. Run timeline: status changes, step times and copy results do not reach screen readers or the keyboard (Fixed in ticket 24).**
- **Bug.** Partly checkable by a **code** check (`role="status"` inside a conditional render; a `TooltipTrigger` whose `render` is not a button or link).
- **Where:**
  - `run-timeline.tsx:412-418`: `<p role="status">Working…</p>` mounts together with its text.
  - `:352`: the status badge flips to Waiting, Done or Canceled silently.
  - `:199-204`: `<TooltipTrigger render={<time … />}>`. A `<time>` cannot take focus, so the wall-clock time is mouse-only, and it is hidden below `@md/run`.
- **Why it matters:** WCAG 4.1.3 and 2.1.1. An agent run is long and asynchronous; a screen-reader user never hears that it is waiting for them.
- **Fix:** one always-rendered `sr-only` `role="status"` in the header, set from the badge label when the status changes. Put the clock in `sr-only` text inside the `<time>`, or make the trigger focusable.
- **Not verified** with a screen reader.

**16. Destructive actions with no confirmation in the block.**
- **Taste.** Each has the distinct destructive look, so it is not an escalation trigger. Not checkable.
- **Where:**
  - `members.tsx:461`: Revoke removes a pending invite at once, while Remove member asks first (`:472-498`).
  - `blocks/projects-table/projects-table.tsx:309-312,145-149,656-665` and `blocks/detail-drawer/detail-drawer.tsx:401-404`: "Delete project" and bulk Delete call `onAction` directly. The confirmation exists only in JSDoc (`projects-table.tsx:468`, `detail-drawer.tsx:276`) and `detail-drawer.mdx:36`.
- **Why it matters:** the obvious wiring of `onAction('delete')` to an API deletes with no question asked.
- **Fix:**
  - Revoke: an Undo in the existing status line ("Invite to x revoked. Undo").
  - Delete: build in the Settings `ConfirmDialog` ("Delete Fernhill Books?", `Cancel` / `Delete project`) and call `onAction` on confirm only.
- **Triage:** not doing. Taste the style skill does not settle; the blocks hand the action to the app, and their JSDoc and docs ask it to confirm.

**17. Notification titles are links that never navigate.**
- **Bug.** Not checkable.
- **Where:** `dashboard-analytics.tsx:937-946`, `dashboard-crm.tsx:897-906`: `href={`#${item.id}`}` with `event.preventDefault()`.
- **Why it matters:** the title is announced as a link, but Cmd-click opens `#mention`. Without `onNotificationOpen` it only marks the item as read.
- **Fix:** add `href?: string` to `DashboardNotification`. With no `href`, render the title as a `<button type="button">`.

**18. Usage overview: the chart breaks the Kosmos chart rules, and range changes remount it.**
- **Bug against kosmos-style (`charts.md`).** Checkable by a **code** check (a visible `Recharts.YAxis` in a block; `key={range}` on a chart).
- **Where:**
  - `usage-overview.tsx:363` (`key={range}`).
  - `:368-376` (`CartesianGrid`, a visible `YAxis`, `minTickGap` ticks).
  - `:379` (default band cursor).
  - `stats-overview.tsx:239` (`GrowthChart key={range}`).
- **What is wrong:** `charts.md` asks for no y-axis, first and last x labels only, a thin line cursor, and "morph, don't remount". `key={range}` throws every mark away.
- **Fix:**
  - Drop `key`.
  - `<YAxis hide />`, no horizontal grid, ticks at the first and last index.
  - The Chart component's cursor.

**19. A change is shown as a hue Badge, not the Kosmos stat change.**
- **Bug against kosmos-style (Status and tints).** Checkable by a **code** check (a `Badge variant` choosing between `'green'` and `'red'`).
- **Where:** `usage-overview.tsx:168-171` (with its own `formatChange` at `:137-139`) and `feature-section.tsx:100`.
- **What is wrong:** hue Badges are for categories. A change in a stat tile is a green ▲ or red ▼ with the signed number in `text-tint-*-foreground`, then the muted "vs. last period". `stats-overview` already does this through `lib/stat-delta`.
- **Fix:** `statDelta(change, { goodWhen })` with the `MetricChange` markup (`stats-overview.tsx:150-177`). Extract it once for all three.

#### LOW

**20. Hand-made status dots instead of `StatusDot`.**
- **Bug (consistency).** Checkable by a **code** check: a small `rounded-full` span with `bg-success`, `bg-warning` or `bg-muted-foreground` in `blocks/` or `examples/`.
- **Where:**
  - `blocks/command-menu/command-menu.tsx:76-80,189-192`. The public `CommandMenuItem.status.dot` takes a raw class string.
  - `detail-drawer.tsx:105-109,147-154`: 8px dots.
  - `bento.tsx:72`.
  - `examples/page-header-demo.tsx:35-39,101`.
- **What is wrong:** the same project status looks different in Projects table (a 6px `tint-*-dot`) and in the drawer.
- **Fix:** `StatusDot` with `done`, `pending` or `waiting`. Type the command menu status as `{ label, state }`.

**21. HeroProduct: a scrollbar shows in the inert picture, and the top bar has no sidebar trigger at 375.**
- **Bug (October item, still open).** Checkable by a **browser** check: a visible `[data-slot=scroll-area-scrollbar]` inside `[inert]`.
- **Where:** `blocks/hero/hero-product.tsx:49` (the inert wrapper) and `:17-19` (the header holds only `<h3>Overview</h3>`).
- **What is wrong:** measured on `/view/hero-product` at 1280: two vertical scrollbars, 6×314 and visible. The landing page hides its own copy; the block does not. At 375 the sidebar is a closed drawer, and nothing in the header hints at navigation.
- **Fix:**
  - `[&_[data-slot=scroll-area-scrollbar]]:hidden` on the inert wrapper.
  - A visual `SidebarTrigger` in the sample header.

**22. The sidebar resize handle's focus line is cut at both ends.**
- **Bug (October 1f, still open).** Checkable by a **browser** check: the site check flags it.
- **Where:** `/view/dashboard-analytics` and `/view/dashboard-crm`, both themes. `div[data-slot=sidebar-resize-handle]` is cut 2px top and bottom by `sidebar-wrapper` (`overflow-hidden`). Cause in `ui/sidebar.tsx`.
- **Fix:** inset the handle by 2px top and bottom (`inset-y-0.5`), or draw its 4px line as a pseudo-element inside the wrapper.

**23. Live regions that mount with their text or start as `display: none` (Fixed in ticket 24).**
- **Bug.** Checkable by a **code** check (`role="status|alert"` inside a conditional, or with `empty:hidden`).
- **Where:**
  - Empty states with `role="status"`: `dashboard-analytics.tsx:415`, `dashboard-crm.tsx:513,592,645`.
  - `settings.tsx:364`: `role="alert"` with `empty:hidden`. `new-item-dialog.tsx:282` uses `empty:sr-only`, which is right.
  - `detail-drawer.tsx:345-360`: Add note announces nothing, and an empty submit only moves focus.
  - `blocks/auth-forms/auth-forms.tsx:225-231`: `FormAlert` is inserted together with its text, and it is a grey card, not the destructive `Alert`.
- **Fix:**
  - Drop `role="status"` from static empty states.
  - `empty:sr-only` in the settings alert.
  - An always-rendered status line for "Note added", and an inline error for an empty note.
  - `<Alert variant="destructive">` in a container that is always rendered.
- **Not verified** with a screen reader.

**24. Docs preview frame marks the iframe root before React hydrates it.**
- **Bug (docs tooling).** Checkable by the **browser** check's console check. It already catches it, but only 3 of 16 loads.
- **Where:** `components/docs/preview-frame.tsx:35-43`.
- **What is wrong:** see the verdict above. The fix is in the docs code, not the blocks.
- **Fix:** move both flags onto the view document's `<html>`, which already has `suppressHydrationWarning`, and style the root with `in-data-in-frame:` variants. Or have the view page post `kosmos:hydrated` and measure only after it.

**25. Writing: sentences built around variables, and plural ternaries.**
- **Bug (translation).** Checkable by a **code** check (better-writing's `=== 1 ?` pattern).
- **Where:**
  - `run-timeline.tsx:173-175,389`
  - `members.tsx:85,238,308-309,320`
  - `kanban-board.tsx:116,349`
  - `dashboard-crm.tsx:561` (`row.deals === 1 ? 'deal' : 'deals'`)
  - `dashboard-analytics.tsx:360-361,404` ("Visitors a {week|day} against the {rangeLabel} before")
  - `blocks/page-header/page-header.tsx:138,247`: `title.toLowerCase()` gives "Search q4 roadmap".
  - `examples/projects-table-demo.tsx:23`
- **Fix:** whole messages per case through an `Intl.PluralRules('en-US')` helper. Keep the title's case in the search placeholder.
- **Triage:** not doing, except the search placeholder's case (ticket 31). Kosmos ships English copy, the English plurals are correct, and the style skill sets no translation rule.

**26. Writing: the same thing worded two ways, and labels that miss.**
- **Taste.** Not checkable, except the duplicate "Learn more" (**code** check: the fallback is used with no `linkLabel`).
- **Where:**
  - "You are all caught up" (`dashboard-crm.tsx:514`) beside "You’re all caught up" (`dashboard-analytics.tsx:866`, `dashboard-crm.tsx:826`).
  - "Clear all" (`page-header.tsx:321`) beside "Clear filters" (`:293`).
  - "Search" (`command-menu.tsx:363`) beside "Search…" (`app-sidebar.tsx:273`).
  - "vs previous period" (`usage-overview.tsx:172`), "vs. last period" (`stats-overview.tsx:172`) and "vs. previous 30 days" (`feature-section.tsx:101`).
  - The button "Deal" (`dashboard-crm.tsx:476`) is not verb-first: use "New deal".
  - `aria-label` "Call: Call Copperline Bank" (`dashboard-crm.tsx:527`).
  - Range items "7d", "30d", "90d" with no spoken form (`dashboard-analytics.tsx:377-381`).
  - `No results for “”` when the query is empty (`command-menu.tsx:406`).
  - Six identical "Learn more" links (`bento.tsx:315` fallback; no sample sets `linkLabel`).
  - "Drag a card here to plan it" on an empty or filtered board (`kanban-board.tsx:381-387`).
  - "Fix or remove the 3 addresses in red" points at color (`members.tsx:308`).
  - Danger zone actions succeed silently, and "That did not work. Try again." names no cause (`settings.tsx:333-345`).
- **Fix:** one term per thing (the Kosmos table's "vs. last period", "Clear filters", "Search…"), verb-first labels, a named link per bento tile, and copy that says what failed and the next step.

**27. Smaller structure and API points.**
- **Taste.** Not checkable unless noted.
- **Fixed height on wrapping text:** `detail-drawer.tsx:159` puts `h-7.5` on a `dt`, which overflows when its label wraps. Use `min-h-7.5`. **Code** check: a fixed `h-*` on an element that holds text.
- **Hard-coded announced shortcut:** `navbar.tsx:364` sets `aria-keyshortcuts` to `'Meta+K Control+K'` whatever `shortcut` says. **Code** check.
- **Duplicate landmark name:** AppSidebar's `<nav aria-label="Main">` (`app-sidebar.tsx:283`) sits beside the Navbar's default "Main" in the showcase and landing page. Give it its own name or a `navLabel` prop. **Browser** check: axe `landmark-unique`.
- **Hard-coded heading levels:**
  - `showcase.tsx:27-34` puts an `h3` above StatsOverview's `h2`s.
  - ErrorPage `h1`, RunTimeline `h2`, Footer `h2`, kanban `h3` and members `h2`, `h3`, `h4` take no `headingLevel`.
  - Members uses "Members" as the section label, the `h2`, the `h3` and the table label (`members.tsx:277,283,331,336`).
- **Wrong item marked current:** `dashboard-analytics.tsx:1043` and `dashboard-crm.tsx:984` mark "Overview" as the current page for Analytics and Sales.
- **App page title size:** `examples/app-sidebar*.tsx` and `showcase.tsx:31` set page titles in `text-body`. Kosmos and both dashboards use `text-title font-medium`.
- **Mixed heights in one row:** `members.tsx:318-319` puts a 34px select beside a 36px `lg` Button. Kosmos says a field beside a Button takes the Button's height.
- **Radius:** the kanban board's `rounded-3xl` (`kanban-board.tsx:585`) is the bottom-sheet step. The drawer's eyebrow uses `font-medium` (`detail-drawer.tsx:207`); the Kosmos eyebrow is 400.
- **Props on the wrong element:** `HeroProduct` spreads `{...props}` onto the inner Hero but `className` onto the outer section (`hero-product.tsx:42-43`), so `id`, `aria-*` and `data-*` land on the wrong element.
- **Missing states:**
  - Usage overview has no error state (`:231-250`).
  - Its budget meter stays `warning` at 131% (`:454`); use `destructive` past 100%.
  - New item dialog drops typed text on Escape or an outside click (`new-item-dialog.tsx:223-232`).
- **Demo data off the demo world:**
  - Lena's bio "Platform engineer" (`settings.tsx:401`); she is the Product lead.
  - The hero announcement (`hero.tsx:10`) and Bento's six component tiles that link into Kosmos docs.
  - `NumberField` with no `locale` (`settings.tsx:582`) shows "80 %" in a de or fr browser. **Code** check.
- **Copied code:** both dashboards copy `HeaderInbox`, `KpiStrip`, `TwoLine`, `initials` and `trendLabel` verbatim, so findings 1, 8 and 17 must land twice. A maintenance note, not a UI flaw.
- **Triage:** split across tickets 21, 25 to 28 and 31 (see Triage, Finding to ticket). Not doing: the `headingLevel` props and Members' repeated label (an API addition and a wording preference the style skill does not settle), the Usage overview error state and the New item dialog on Escape (product behavior it does not settle), and the copied code (code structure, out of scope).

### Kosmos style (reported, not fixed)

- **Input boundary:** text fields (page-header search, members, settings) use `shadow-field`, about 1.2:1. `better-accessibility` asks for 3:1. Matches conflicts.md, Input boundary.
- **Idle navigation:** sidebar idle items and group labels in `text-muted-foreground`. `better-accessibility` prefers fuller contrast. Matches conflicts.md, Idle nav items and Sidebar group labels.
- **Disabled until valid:** Settings Save is off until a field changes (`settings.tsx:194`), and members Send is off until the addresses are valid (`members.tsx:319`). `better-accessibility` prefers an enabled button that validates on submit. That is a recommendation, never HIGH, and the Save behavior is documented in `settings.mdx`. The focus loss in finding 8 is a separate bug.
- **Logo marquee pause button:** it shows only on keyboard focus (`logo-marquee.tsx:177`), as `marketing.md` (Motion, Drift) specifies. Hover pauses for a mouse. Touch has press and hold only. VoiceOver activation was **not verified** on a device.
- **Placeholders:** "Search…" and "Add a note…" are instructions, not examples, which `better-writing` flags. This is a repo-wide convention. It is not in conflicts.md, so the maintainer may want to record it there.
- **Error page type roles:** it uses `text-hero` and `text-lead`. That is allowed: the registry marks it a marketing block.
- **Headings as focus targets:** `outline-none` on `tabIndex={-1}` headings (`members.tsx:331,420`; `auth-forms.tsx:182`) receive focus only from code. The style's "outline-none with no replacement" detection would flag them by mistake, so a future code check should allow `tabIndex={-1}`.

### Checked and clean

- No text contrast failure at rest in any block preview, light or dark, at 375 and 1280.
- No page overflow at 375 in any block preview.
- Every chart surface is named through its SVG `<title>` and shows the 2px ring.
- The Members invite field's name is "Invite by email" (measured).
- Every `shadow-*` ring has `border border-transparent`.
- Movement, scale and rotation are gated by `motion-safe:`, with opacity fallbacks (kanban, pricing, navbar, bento, feature rows, run timeline).
- No padding on a marketing block's root, and no container variant on its own `@container`.
- Auth forms validate on submit, focus the first invalid field and use the right `autocomplete` tokens.
- Pricing's live region is rendered empty first.
- Removing a member returns focus to the next row.

### Counts

27 findings: 7 HIGH, 12 MEDIUM, 8 LOW.

| Severity | Bug | Taste |
| --- | --- | --- |
| HIGH | 7 | 0 |
| MEDIUM | 11 | 1 (finding 16) |
| LOW | 6 | 2 (findings 26, 27) |
| **Total** | **24** | **3** |

- **Checkable:** 23 by a code check, a browser check or both; findings 12, 15, 26 and 27 only in part. Not checkable: findings 6, 11, 16 and 17.
- **Kosmos style:** 7 items, not fixed.

## Docs site

Ticket 05. Reviewed with `better-interface` and its six `better-*` domain skills, with `kosmos-style` winning every conflict.

### Scope

- **Covered:**
  - The docs shell: site header on docs pages, skip link, docs sidebar (docked and phone drawer), header tabs, page header (eyebrow, title row, Copy page menu, previous and next), table of contents (right rail and phone disclosure), page links, previous and next cards.
  - Search (⌘K palette): empty, typing, loading, no-match and error states.
  - Docs MDX parts: prose, headings with copy-link, code blocks (collapse, copy, scroll), package manager tabs, install tabs, steps, callouts, tables, API tables, link cards, docs index cards, preview shell, block viewer, preview frame, foundations widgets (color swatches, type roles, shadows, radius, easing demo).
  - The changelog page and an entry page, the docs not-found page (`/docs/<missing>`), the site not-found page (`/<missing>`), the docs error page (code only).
  - Code: every file in `components/docs/`, `components/docs/foundations/`, `components/mdx.tsx`, `app/(site)/docs/`, `app/(site)/layout.tsx`, `app/global-not-found.tsx`, `app/global.css`, and the site parts the docs use (`site-header`, `site-nav`, `skip-link`, `search-button`, `search-dialog`, `theme-toggle`, `github-link`, `site-preset-menu`, `not-found-page`, `page-error`), `lib/docs-nav.ts`, `lib/docs-tabs.ts`.
- **Measured** on the dev server (port 3010, branch `feature/audit-and-checks`), Default preset, light and dark, 375 and 1280:
  - `pnpm site-check --port 3010 --workers 1 --check overflow --check console --width 375 --theme light --route /docs/installation --route /docs/foundations --route /docs/blocks --route /docs/changelog/<3 entries>`: 36 routes, 0 findings.
  - Ticket 03's run covers `/docs/components` and `/docs/charts` (81 routes, light and dark, 375): 0 findings. Together every docs route except the changelog entries was loaded at 375. The changelog page renders every entry's body, so it stands in for them.
  - `scratchpad/audit-run/05-measure-docs.mts` (built on `openSitePage`): rendered text contrast against the composited background, truncation with no way back, unnamed controls, targets under 24px, content past the viewport, heading skips, landmarks and page titles. 17 pages, light and dark, 375 and 1280 (preview stages skipped; they are tickets 03 and 04).
  - `scratchpad/audit-run/05-interact.mts`: Tab walks (`/docs/components/button` at 375 and 1280, `/docs/changelog`), the phone drawer, search by shortcut and by button, the TOC disclosure, sidebar clipping and edge fade, reflow at 320 (7 pages), prose line length, code block colors, the current sidebar item, and the preset on both not-found pages.
  - `pnpm prose` (Vale) and `pnpm exec eslint components/docs components/site app`: lint clean, 59 Vale warnings in `content/docs`.
- **The first site-check run's docs findings, re-checked:**
  - The 55 "`Footer` cut by `nav[scroll-area-viewport]` bottom 1px" findings: real, and worse than 1px. Tab down the docs sidebar and the focused item stops 3px above the edge, inside the 32px edge fade. Finding 3.
  - The 79 "cut by `div.h-(--collapsible-panel-height)` right 1px" findings, all in dark (check fixed in ticket 15): not a focus ring. The current item's dark `shadow-control` ring is cut by the group panel, and the check counts any spread shadow as a ring. Finding 5.
  - Hydration mismatch on `/docs/blocks/new-item-dialog` and `/docs/blocks/settings`: the preview frame race from the blocks audit. Not reproduced in my 28 single loads, as expected at 3 in 16. Finding 2.
  - `/docs/blocks` load timeout: not reproduced; it loaded at 375 and 1280.
  - `/docs/components/data-table` "MRR" and `/docs/components/sidebar` resize handle: these come from the examples, so they belong to ticket 03 (its findings 9 and 22).
- **Left out:**
  - The examples and blocks inside preview stages (tickets 03 and 04), the landing page, the Presets page and the preset style passes (ticket 06).
  - The docs error page in the browser. No route throws, so it was reviewed from code only.
  - Screen readers (VoiceOver, NVDA). Live-region announcements were checked in the DOM only. **Not verified.**
  - 200% zoom. Reflow at 320 stands in for it (0 overflow on 7 pages). Search results under load: at 1280 the search API had not answered within 2.5s, so results were checked at 375 only.
  - RTL: the docs set `dir="ltr"` on code only and ship no RTL locale.

| Domain | Evidence | Result |
| --- | --- | --- |
| Accessibility | Tab walks, drawer and search focus, names, landmarks, heading order, live regions in code | 4 findings (3, 7, 8, 10) |
| Layout | Overflow at 375 (117 routes) and 320 (7), past-viewport scan, tab order against visual order, wayfinding | 3 findings (1, 9, 11). No overflow anywhere |
| Writing | Chrome strings, search states, not-found and error copy, Vale on `content/docs` | 1 finding (15); 9 and 10 also touch copy |
| Typography | Prose line length, type roles in docs parts, truncation mechanics | 1 finding (4); 1 is truncation |
| Colors | Rendered contrast on 17 pages in both themes (0 failures), code theme values | 1 finding (14) |
| UI polish | Shadows and clipping, motion gates, transitions, inline styles, document shells | 5 findings (2, 5, 6, 12, 13) |

### October audit, re-checked in this scope

| October item | Now |
| --- | --- |
| 1d Last sidebar nav item ring cut by the scrolling nav | **Moved, not fixed.** The last item now has 12px of room. Every item Tab scrolls in from below stops 3–8px from the edge, inside the 32px fade. Finding 3. |
| 2.6 Code themes: cream background, warm ink, five fixed hues | **Partly fixed.** The cream background no longer renders (`figure` and `pre` are transparent over `card`). The warm ink and the five hues remain. Finding 14. |
| 4 Writing: UK spellings, Avoid terms, marketing words, long sentences | **Mostly fixed.** Vale now runs in `pnpm lint`. No UK spelling left in `content/docs` (the `'cancelled'` status value is API, see the blocks audit). `widget`, "at a glance", "fully usable" and "easy to read" are gone. Left: "quick motion" in `index.mdx:7`, and 34 sentences over 25 words. Finding 15. |
| 5a Flickering grid docs page scrolls sideways at 375 | **Fixed** (`DocsBody` wraps inline code with `overflow-wrap:anywhere`). 0 overflow findings. Dropped. |
| 5c React warning on the Checkbox docs page | **Not reproduced** (ticket 03's 4 loads, 0 console findings). Dropped. |
| 5d Example focus clips on docs pages | Belongs to the examples: tickets 03 and 04. |

### Findings

Ranked by severity, then by reach. **Checkable** names the kind of check that would catch the flaw next time.

#### HIGH

**1. A color token's name is cut off on the Color page with no way to read it.**
- **Severity:** HIGH (escalation trigger: truncated content with no way to reach the full value). **Kind:** bug. **Checkable:** yes, browser: text with `text-overflow: ellipsis` whose `scrollWidth` exceeds `clientWidth` and that has no `title`, tooltip or `aria-describedby`.
- **Where:** `components/docs/foundations/copy-swatch.tsx:39` (`<code className="truncate font-mono text-body">{tokenClass}</code>`). Seen on `/docs/foundations/color`, Sidebar group, `text-sidebar-primary-foreground`, at 375 and 1280, light and dark.
- **What is wrong:** the class name is the one thing the card exists to show, and it ends in "…". The full name reaches only the clipboard, so a reader has to paste it to find out what it is.
- **Fix:** let it wrap: `min-w-0 wrap-break-word` in place of `truncate` on the `<code>`. The "Copy" label beside it is already `shrink-0`.

#### MEDIUM

**2. The docs preview frame writes attributes onto the iframe's page before React hydrates it.**
- **Severity:** MEDIUM. **Kind:** bug. **Checkable:** yes, browser. The site check's console check already catches it, but only in about 3 of 16 loads. A dedicated pass that reloads each block page several times would make it reliable.
- **Where:** `components/docs/preview-frame.tsx:38` (`root.dataset.inFrame = ''`) and `:43` (`toggleAttribute('data-centered', …)`), run from the iframe's `load` event and from `readyState === 'complete'` (`:65`). It reaches every block viewer: all 28 `/docs/blocks/*` pages. Seen on `new-item-dialog` and `settings` (blocks audit, finding 24).
- **What is wrong:** under load, `load` fires before React has hydrated `[data-preview-root]` (`app/(view)/view/[name]/page.tsx:33`). React then finds `data-in-frame=""` that the server never rendered, logs a hydration mismatch and keeps the client tree out of sync with the DOM.
- **Why it matters:** a console error on a docs page fails the release browser check at random, and a mismatched subtree can keep stale attributes.
- **Fix:** put both flags on the iframe document's `<html>`, which already has `suppressHydrationWarning`, and style the root with an ancestor variant (`in-data-in-frame:p-4`). Or have the view page post `kosmos:hydrated` and measure only after it.

**3. Keyboard focus in the docs sidebar lands inside the scroll edge fade.**
- **Severity:** MEDIUM. **Kind:** bug. **Checkable:** yes, browser. Extend the focus-ring check: on each Tab stop inside a `scroll-area-viewport`, fail when the ring box overlaps an edge whose fade is active (`--scroll-area-overflow-y-end` > 0).
- **Where:** the cause is `registry/kosmos/ui/scroll-area.tsx:64-65`: `scroll-p-1` gives 4px of scroll padding, but the edge fade is 2rem (`:69`). It shows in the docs sidebar (`components/docs/docs-sidebar.tsx:123`, `SidebarContent` with `focusable={false}`) on every docs page whose sidebar scrolls (all of Components, Charts and Blocks at 800px tall). Measured on `/docs/blocks/settings` at 1280: Tab stops "Feature section" 8px and "Footer" 3px above the bottom edge, inside a 32px fade, with the ring cut by 1px. These are the first run's 55 findings.
- **What is wrong:** the browser scrolls a focused item only far enough to clear the scroll padding, 4px. That leaves the item, its label and its focus outline under the mask, drawn at partial opacity.
- **Why it matters:** the ring is a 3:1 mark at full strength. Faded, it falls under the floor exactly where a keyboard user is looking. This is the October 1d finding in a new form.
- **Fix:** make the scroll padding match the fade, `scroll-py-8` in place of `scroll-p-1` on the viewport, so a focused item always stops clear of it. The same file holds ticket 03's finding 9 (scroll a partly visible focused item into view), and the two fixes belong together.

**4. Docs prose runs 88 to 95 characters a line.**
- **Severity:** MEDIUM (every docs page). **Kind:** taste, in line with the style skill ("Prose measure is set in em"). **Checkable:** yes, browser: the average characters per line of the first long paragraph in `#content article`, failing above 75.
- **Where:** `app/(site)/docs/[[...slug]]/page.tsx:40` (`max-w-3xl` on the article) and `:53` (`DocsBody` sets no measure). Measured at 16px/28px: `/docs/installation` 648px wide, about 88 characters, and 92 at 1600; `/docs/components/button` 688px, about 95.
- **What is wrong:** long lines make the eye's return to the next line slow and error-prone. Block pages already cap `p`, `ul` and `ol` with `max-w-prose`, but other pages have no cap.
- **Fix:** cap the prose children, not the article, so code blocks, previews and tables keep the full column: `[&>p]:max-w-[37em] [&>ul]:max-w-[37em] [&>ol]:max-w-[37em]` on `DocsBody` (about 75 characters at the measured 7.4px average). Use the same cap in place of `max-w-prose` on block pages, so both read alike.
- **Triage:** ticket 30, at the Kosmos measure `40em` (style skill, Typography). The 75-character target would change that value: Kosmos style.

#### LOW

**5. In dark mode the current sidebar item loses its right edge, and the site check reads it as a cut focus ring.**
- **Severity:** LOW. **Kind:** bug. **Checkable:** yes, browser. The site check flagged it as a cut focus ring (79 findings); the check half is fixed in ticket 15, the panel padding is not.
- **Where:** `components/docs/docs-sidebar.tsx:222-230`. The group's `Collapsible.Panel` is `overflow-hidden`, and its `SidebarMenu` gives the items the panel's full width. Measured on `/docs/components/button` and `/docs/charts/donut-chart` in dark: the item ends at x 248, and so does the panel.
- **What is wrong:** the dark current item is raised with `shadow-control` (`registry/kosmos/ui/sidebar.tsx:756`), whose 1px outer ring is clipped on the right, and on the bottom for the last item of a group. The focus outline there is already drawn inside, so the site check is flagging this shadow, not the focus ring.
- **Fix:** `pe-px pb-px` on the panel's `SidebarMenu` (`:230`), so the ring has its 1px. In the check, `measureFocusRing` (`lib/site-check.ts`) should count only the outline and the shadows that change on focus, so a resting `shadow-control` is not reported as a focus ring.

**6. The site's not-found page ignores the visitor's preset.**
- **Severity:** LOW. **Kind:** bug. **Checkable:** yes, code: `app/global-not-found.tsx` renders `SitePresetScript` and `SitePresetSync`, as `app/(site)/layout.tsx` does. Or browser: `#site-preset` exists when a preset is stored.
- **Where:** `app/global-not-found.tsx:14-19`. Measured with Console stored: `/docs/installation` and `/docs/nope` have the preset style and a violet `--ring`; `/nope` has no `#site-preset` and an ink `--ring`, while the header's button still says "Preset: Console".
- **What is wrong:** this document brings its own `<html>`. It does not have the preset script, the sync, the viewport `themeColor` or the `selection:` brand class.
- **Fix:** render `<SitePresetScript />` in its `<head>`, add `<SitePresetSync />`, and export the same `viewport`. Better, share one document shell with `app/(site)/layout.tsx` so the two cannot drift again.

**7. Copy buttons fail silently.**
- **Severity:** LOW. **Kind:** bug. **Checkable:** partly, code: a `useCopyButton(` or `navigator.clipboard` call with no rejection handler.
- **Where:** `useCopyButton` (Fumadocs) handles success only. It is used by `components/docs/code-block.tsx:167` (Copy code), `docs-heading.tsx:17` (Copy link to section), `page-actions.tsx:39` (Copy Markdown, which also fetches first) and `foundations/copy-swatch.tsx:14`. In `components/site/search-dialog.tsx:268-271`, "Copy install command" swallows the error with `() => {}`.
- **What is wrong:** when the clipboard is denied, or the Markdown fetch fails, nothing changes on screen and nothing is announced. "Copy install command" also changes its row to "Copied" with no status region, so a screen reader may not hear it.
- **Fix:** one shared copy hook with a failed state that says "Couldn't copy. Select the text and copy it." in the existing `role="status"` span. Give the palette action the same status line.

**8. In the install tabs, focus reaches the Copy button before the tabs beside it.**
- **Severity:** LOW. **Kind:** bug (WCAG 2.4.3 focus order). **Checkable:** no.
- **Where:** `components/docs/docs-tabs.tsx:46-48`: the absolutely placed Copy button comes before `TabsList` in the DOM. Measured on `/docs/components/button` at 375, Tab order: "CLI" tab, the CLI panel, **Copy code**, then the "npm" tab and its panel. On screen, Copy sits at the end of the npm/pnpm/yarn/bun row. The outer CLI panel is also a tab stop that only wraps the card.
- **Fix:** move the Copy button after `TabsList` in the DOM; its absolute position keeps it where it is. Drop the outer `TabsContent` tab stop (`tabIndex={-1}`) where its content already holds focusable tabs.

**9. Sidebar wayfinding: the overview pages carry two names, and changelog entries mark nothing.**
- **Severity:** LOW. **Kind:** taste. **Checkable:** partly, browser: every docs page has exactly one `aria-current` item in the docs sidebar.
- **Where:**
  - `lib/docs-nav.ts:163` names the first item "Overview", while its pages are titled "About components", "About charts" and "About blocks" (`content/docs/{components,charts,blocks}/index.mdx`).
  - `components/docs/docs-sidebar.tsx:157` (`isActive={item.url === pathname}`): on `/docs/changelog/2026-10-24-navbar` the sidebar marks no item. The header marks Changelog.
- **What is wrong:** one page with two names, and a page that the sidebar cannot place.
- **Fix:** use one name for both: title the pages "Overview" with the description kept, or label the item "About". Mark the Changelog item current on its entry pages: `item.url === pathname || (item.url === '/docs/changelog' && pathname.startsWith('/docs/changelog/'))`.
- **Triage:** the changelog item is ticket 30. The naming is not doing: which name is a preference only.

**10. Screen-reader names in the page chrome: one name for every heading's copy button, and new tabs left unannounced.**
- **Severity:** LOW. **Kind:** taste. **Checkable:** yes, browser: buttons on one page that share an accessible name.
- **Where:**
  - `components/docs/docs-heading.tsx:44`: `aria-label="Copy link to section"` on every heading, so a button list reads the same phrase 10–20 times per page.
  - `components/docs/page-actions.tsx:61-75`: "Open in Claude", "Open in ChatGPT" and "View source on GitHub" open a new tab with only a hidden arrow icon. The Base UI chip on the same header says "(opens in a new tab)" (`page-header.tsx:77`).
- **Fix:**
  - Name the copy button after its heading: `aria-labelledby` pointing at a `sr-only` "Copy link to" span and the heading's link id.
  - Add the same `sr-only` "(opens in a new tab)" to the three menu items.

**11. The table of contents scrolls in a native box, not `ScrollArea`.**
- **Severity:** LOW. **Kind:** taste, a style rule (Overflow: "Content that scrolls inside a frame … scrolls in `ScrollArea`"). **Checkable:** yes, code: `overflow-y-auto`, `overflow-x-auto` or `overflow-auto` in `components/docs` outside the code block viewport.
- **Where:** `components/docs/docs-toc.tsx:76`. It matters most on `/docs/changelog`, whose rail lists over 100 entries.
- **What is wrong:** there is no edge fade, so with macOS overlay scrollbars nothing shows that the list continues. It is also the one docs scroller that looks unlike the sidebar beside it.
- **Fix:** `<ScrollArea>` with `viewportRef` for `ScrollProvider`, and `focusable={false}`, since the links scroll themselves into view.

**12. An inline `style` slips past the lint rule when it is conditional.**
- **Severity:** LOW. **Kind:** taste, a style rule ("Inline `style` carries only CSS variables"). **Checkable:** yes, code: extend `styleSelectors` in `eslint.config.mjs:106-115` to `ConditionalExpression` and `LogicalExpression` objects.
- **Where:** `components/docs/preview-shell.tsx:141` (`style={stageHeight ? { height: stageHeight } : undefined}`). `pnpm exec eslint components/docs` passes it, because the selector matches only an `ObjectExpression` directly inside the attribute.
- **Fix:** `style={{ '--stage-height': … }}` with `h-(--stage-height)`, and the wider selector.

**13. Under reduced motion, the block viewer's width jumps.** (Fixed in ticket 23)
- **Severity:** LOW. **Kind:** taste, a style rule ("the same change becomes an opacity cross-fade, never an instant jump"). **Checkable:** yes, code: `motion-reduce:transition-none` in `components/` or `registry/`.
- **Where:** `components/docs/block-viewer-panels.tsx:89`.
- **Fix:** under `motion-reduce:`, fade the frame out and back in around the width change (`transition-[opacity]`), as the code block's expand does (`code-block.tsx:129-130`).

**14. Code blocks keep a warm ink and five fixed hues.**
- **Severity:** LOW. **Kind:** taste. It needs the maintainer's decision, since ADR 0009 covers palette tokens, not syntax colors. **Checkable:** yes, code: a test that `text`, `comment` and `punctuation` in `code-themes.ts` have OKLCH chroma 0.
- **Where:** `components/docs/code-themes.ts:11-34`. Measured: code text renders `rgb(38, 37, 30)` in light and `rgb(245, 245, 242)` in dark, against the true-grey `foreground` around it. The comment at `:6-9` cites "the chart and tag hues", but charts are now a mono ramp.
- **Fix:** set `text`, `comment` and `punctuation` to the hex of `foreground`, `muted-foreground` and a step between, so code ink matches the page. Decide whether the five hues stay; if they do, rewrite the comment to say where they come from.
- **Triage:** not doing. The maintainer keeps the warm ink and the five hues: Kosmos style.

**15. Docs prose: 59 Vale warnings.**
- **Severity:** LOW. **Kind:** taste. **Checkable:** yes, code: `pnpm prose` already reports them as warnings.
- **Where:** `content/docs`:
  - 34 `Kosmos.SentenceLength` (`blocks/pricing.mdx:62-63`, `blocks/stats-overview.mdx:25`, `blocks/dashboard.mdx:12,57,60`, …)
  - 22 `Google.Passive` (`changelog/2026-10-27-one-tint-family.mdx`, …)
  - 2 `write-good.Weasel`
  - 1 `Kosmos.Hedges`
  - Also "quick motion" in `index.mdx:7`.
- **Fix:** split the long sentences and make the passives active. Once `content/docs` is clean, raise `Kosmos.SentenceLength` to `error` for it.

Counts: 15 findings. 1 HIGH, 3 MEDIUM, 11 LOW. 7 bugs (1, 2, 3, 5, 6, 7, 8) and 8 taste (4, 9–15). 14 are checkable: 7 by browser (1, 2, 3, 4, 5, 9 partly, 10) and 7 by code (6, 7 partly, 11, 12, 13, 14, 15). Finding 8 is not.

### Kosmos style

These findings disagree with the style skill. They are reported here and not fixed.

| Reviewer says | Where in the docs | Kosmos value (wins) |
| --- | --- | --- |
| `better-accessibility`: a solid, saturated focus color | Every docs control: `outline-ring`, ink at 55% | `conflicts.md`, Focus color: `ring` passes 3:1 on every surface, and the 2px offset leaves a page-color gap |
| `better-accessibility`: fainter idle text and labels need more contrast; `better-layout`: show hidden list content with a peek | Sidebar group labels (uppercase muted eyebrows), idle nav items in `muted-foreground`, the ScrollArea edge fade as the one overflow cue | `conflicts.md`, Accessibility floor rows; `SKILL.md`, Overflow (edge fade). All measured pairs pass 4.5:1 |
| `better-writing`: errors are calm, with no playfulness | Not-found title "This page drifted out of orbit" (`components/site/not-found-page.tsx:18`) | Not in `conflicts.md`. This is brand voice on a low-stakes page, and the body says what happened and gives two ways on, so it is not a finding. Listed so the maintainer sees the call |

### Verification

**Passed:**
- `pnpm site-check` at 375, overflow and console: 36 routes, 0 findings. Ticket 03's 81 docs routes: 0 findings.
- Reflow at 320: 0px overflow, and no header control past the edge, on 7 pages.
- Contrast: no text pair under its floor on 17 pages, in both themes and at both widths.
- Names: no unnamed control. No target under 24px outside inline links.
- Headings: one `h1` and one `main` per page, no skipped heading level, and a page title on every page.
- Tab walks:
  - The skip link comes first.
  - The header stops are in visual order.
  - Every stop shows a 2px outline.
  - No focused element in the page body sits under the sticky header: `scroll-padding-top: 4.5rem` (`app/global.css:111`).
- Phone drawer:
  - Focus moves in on open.
  - It holds the current item.
  - Escape returns focus to "Docs menu".
- Search:
  - It opens from ⌘K and from the button.
  - Escape returns focus to the button.
  - The no-match state offers three next steps.
  - The loading state is a `role="status"`.
  - At 375 it fits (16..359 of 375).
- Theme switch: Fumadocs sets `disableTransitionOnChange` (`fumadocs-ui/dist/provider/base.js:36`).

**Not verified:** screen-reader announcements, 200% browser zoom, the docs error page in the browser, search results at 1280 under load, and the hydration race's rate (it did not occur in my 28 single loads).

### Verdict

`Block`: one HIGH finding (1) remains. Every domain was inspected; none is `Not reviewed`.

## Landing and Presets

Ticket 06. `better-interface` review (with `better-accessibility`, `better-layout`, `better-writing`, `better-typography`, `better-colors`, `better-ui`), `kosmos-style` winning every conflict. Read-only: no repo file changed.

### Scope and coverage

- **Scope:** the landing page (`/`: `app/(site)/(home)/page.tsx`, `components/site/landing-*.tsx`, `landing-gallery/`), the Presets page (`/presets`: `components/site/presets-view.tsx`, `preset-picker.tsx`, `preset-code-dialog.tsx`, `site-preset-menu.tsx`, the phone Preset drawer, the Get code dialog and the header preset popover) and its preview document (`/preset-preview`, all five tabs: Components, Dashboard, Forms, Overlays, Tokens; `components/preset-cards/*`). Default preset in light and dark at 375 and 1280, then the same pages under Soft, Console, Night and Iris, each as it ships (accent on, its own radius, Default size).
- **How a preset was applied:** the site keeps the choice in `localStorage['kosmos-preset']` (`lib/site-preset.ts`), and an inline head script writes its CSS into `<style id="site-preset">` before first paint. Each run stored `storedPreset(defaultChoice(preset))` and reloaded, then checked that `#site-preset` held the preset's CSS with its `data-slot` rules and that `--ring` and `--shadow-card` had the preset's values. Every one of the 140 matrix loads passed that check. The preview tabs were switched with the page's own `postMessage({ source: 'kosmos-site', type: 'page' })`. The preview ran at 341 and 966 wide, the iframe's inner width on a 375 and a 1280 page.
- **Stack and docs read:** Next.js 16, React 19, Tailwind 4, Base UI, Recharts 3. `AGENTS.md`, `GLOSSARY.md`, `kosmos-style` (SKILL.md, `conflicts.md`, `marketing.md`), ADR 0011, 0014 and 0016, the audit spec, the October audit (`.scratch/audit/report.md`, sections 2, 3 and 5), `.scratch/decisions-black-and-white.md`, and the 03 and 04 sections (their Default findings are not repeated here; where a cause is theirs, the row says so and adds the location).
- **Runtime evidence** (no screenshots), against the dev server on port 3010:
  - `pnpm site-check --port 3010 --route /presets --workers 2`: 0 findings in 4 loads.
  - The site check's `checkPage` on `/` (`06/06-check-home.mts`): 0 findings in 4 loads. `--route /` cannot be used: it selects every route (see Verification).
  - `06/06-measure.mts`: 5 presets × 7 targets (5 preview tabs, `/`, `/presets`) × light/dark × 2 widths = 140 loads, 2 workers. Per load: page overflow, rendered text contrast (alpha and stacking included), icon contrast in controls, oval shapes (a pill radius on a tall element), text cut by a clipping ancestor, text spilling out of buttons, badges and tabs, nameless controls from the ARIA snapshot, and a Tab walk of up to 260 stops checking for a visible change, a ring cut by a clipping ancestor and the ring's contrast against its surround and against the element's own fill.
  - `06/06-focus-all.mts`: focuses every focusable element on the four interactive preview tabs, per preset, at 966 light and 341 dark, and checks ring clipping including the clipper's rounded corners. This covers the Overlays tab, where the Tab walk stops after two stops (finding 4).
  - `06/06-interact.mts`: opens the phone Preset drawer, the Get code dialog and the header preset popover under each preset, light and dark, 375 and 1280. It measures overflow, text contrast, syntax colors against the code surface, the Tab walk and Escape.
  - Probes: `06-table-probe.mts`, `06-overflow-probe.mts`, `06-mincontent.mts`, `06-hover-probe.mts`, `06-selected-probe.mts`, `06-nav-probe.mts`, `06-landing-probe.mts`, `06-stack-hover.mts`, `06-toast-probe.mts` (all in the scratchpad `audit-run/06/`).
- **Left out:** Warm (it carries no style), the picker's other choices (accent off, radii 0/6/8/16, Compact and Comfortable sizes), hover and pressed states beyond table rows and the stack names, 200% zoom and 320px reflow, RTL, forced colors, and a real screen reader. All are **Not verified**. Full-motion entrances were read from code (`landing-motion.css`, `stage.tsx`), not replayed.

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | Tab walks on 140 loads; focus-all on 40 screen loads; ARIA snapshots; landmarks and headings on `/`; drawer, dialog and popover focus and Escape | 5 findings (1, 4, 5, 13, 15) |
| Layout | Overflow on 140 loads; the element that overflows; toast and hero geometry; scroll containers in code | 4 findings (2, 7, 8, 14) |
| Writing | Landing copy, FAQ, Presets page, dialog and preset descriptions against what the CSS ships | 2 findings (10, 12) |
| Typography | Type roles in the preset styles; `tabular-nums`; truncation and clamps on the gallery (none cut) | Clear (Console's page-wide `tabular-nums` is under Kosmos style) |
| Colors | Rendered contrast on 140 loads; syntax colors in Get code under 5 presets × 2 themes; hover fills; nav item colors | 3 findings (3, 9, 11) |
| UI | Preset style rules read line by line; shapes, radii, focus-ring offsets; landing motion gates in code | 1 finding (6) |

**Count:** 15 findings: 0 HIGH, 5 MEDIUM, 10 LOW; 13 bug, 2 taste. Style presets: Iris 3, Night 2, Console 1 (shared with Night), and the Components-tab overflow under every preset, widest under Console. 3 Kosmos-style rows, not fixed.

### Findings

Ranked by severity, then reach. **Kind** is **bug** or **taste**. **Checkable** names the kind of check that would catch it again.

#### 1. Iris: the focus ring sits flush on checked and filled controls and merges with their fill (Fixed in ticket 29)

- **Severity:** MEDIUM. **Kind:** bug. **Preset:** Iris. **Checkable:** yes, code: extend the preset style test in `pnpm test` (the one that forbids `shadow-control` and friends) to forbid `outline-offset` in a style's rules. Also browser: ring color equals the element's own fill with a 0 offset.
- **Location:** `lib/presets/iris-style.ts:72-73` (`':is([data-slot="badge"], [data-slot="checkbox"], [data-slot="switch"], [data-slot="segmented-control-item"], a:not([data-slot="button"])):focus-visible:not([class*="-outline-offset-"])': { 'outline-offset': '0' }`).
- **What is wrong:** under Iris the ring is the accent and so is `primary`, the fill of a checked switch or checkbox and of a primary link-button. With a 0 offset, the ring touches that fill. Measured: ring `rgb(65,36,251)` on fill `rgb(65,36,251)` is **1.00:1** in light, and `rgb(122,102,255)` on `rgb(98,73,255)` is **1.32:1** in dark. Affected: the Notifications switches (Components and Forms tabs), the checked checkboxes (Forms, Overlays), the Accent switch on `/presets`, the landing showcase's selected-row checkboxes, and the landing's "Get started". Focus reads as the control growing 2px, not as a ring around it. It still measures 7.0–7.3:1 against the surround, so this is not a WCAG fail.
- **Why it matters:** Kosmos puts the 2px offset there for exactly this case ("the 2px offset leaves a page-color gap, so an outline still reads around an ink primary button"). The rule also reaches checkboxes and switches, which ADR 0014 lets a style touch only for type.
- **Fix:** delete the rule, so Iris keeps the Kosmos 2px offset.

#### 2. The Presets preview's Components tab scrolls sideways at phone width, most under Console (Fixed in ticket 29)

- **Severity:** MEDIUM. **Kind:** bug. **Preset:** all, widest under Console. **Checkable:** yes, browser: add `/preset-preview` at 341 to the site check's overflow check (fixed in ticket 15: the check now visits it). The site check visits `/presets`, but not the document inside its iframe.
- **Location:** `components/site/preset-components.tsx:130` (`grid items-start gap-4 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3`: below `md` the grid has one implicit `auto` track). The widest child is the Monthly revenue card's `GrowthChart` (`components/preset-cards/data-cards.tsx:57`) and the Members table.
- **What is wrong:** at the iframe's 341px on a 375 phone, the preview document is **13px** wider than its viewport under Default, Soft and Night, **26px** under Console and **3px** under Iris, light and dark. Every column (`div.flex.min-w-0`) is 338–351px wide in a 341px grid. Setting the track to `minmax(0,1fr)` in the browser removes it under Default (0px) and leaves 9px under Console.
- **Why it matters:** the page that shows a preset off scrolls sideways inside its frame on a phone, and cards are cut at the right edge.
- **Fix:** `grid-cols-1` (Tailwind 4 writes `minmax(0,1fr)`) on that grid, then recheck the GrowthChart under Console. If it still pushes, the chart's wrapper needs `min-w-0` (owner: `registry/kosmos/ui/chart.tsx`, ticket 03 scope).

#### 3. Iris: table rows in a card lose their hover and selected fills (Fixed in ticket 29)

- **Severity:** MEDIUM. **Kind:** bug. **Preset:** Iris. **Checkable:** yes, browser: the hovered or selected row's computed fill must differ from the surface behind it.
- **Location:** `lib/presets/iris-style.ts:181-184` (row hover `color-mix(in srgb, var(--card) 60%, transparent)`, selected row `var(--card)`).
- **What is wrong:** every Kosmos table here sits on a card. Iris paints the hovered row with card at 60% and the selected row with card, on a card. Measured: hover `color(srgb 0.98 0.98 0.98 / 0.6)` on `rgb(250,250,250)` in light and on `rgb(27,29,32)` in dark; selected `rgb(250,250,250)` on `rgb(250,250,250)` and `rgb(27,29,32)` on `rgb(27,29,32)`. Both are identical to the surface. Under Default the selected row is `lab(94.78)` on white, and Console, Night and Soft also tint it. Where: the Members table (Components tab), the landing showcase's Projects table (two rows selected), and every DataTable and Table in a card.
- **Why it matters:** clickable rows give no hover feedback, and the selection reads only from the small checkbox.
- **Fix:** derive both fills from a token that differs from `card`, such as `bg-accent` (the Kosmos hover overlay) for hover and `muted` for selected. Or delete both rules so Iris keeps the Kosmos row states.

#### 4. Overlays tab: keyboard focus stops after two stops and the page throws "Maximum call stack size exceeded" (Fixed in ticket 22)

- **Severity:** MEDIUM. **Kind:** bug. **Preset:** all (Default included). **Checkable:** yes, browser: the site check's console check, once `/preset-preview` is in its routes (with the Overlays tab selected).
- **Location:** `components/preset-cards/overlay-cards.tsx:152` (`DropdownMenu open modal={false}`), `:307` (`Dialog open modal={false}`), `:342` (`Drawer open modal={false}`), `components/preset-cards/block-cards.tsx:13`, `:29` (`CommandMenu open modal={false}`), `:43` (`DetailDrawer open modal={false}`). Same cause as 03 finding 13; these are new locations for it.
- **What is wrong:** on the Overlays tab the Tab walk reaches 2 stops (a 1px focus guard `span` twice), then the page logs "Maximum call stack size exceeded". This happens under all five presets, light and dark, 341 and 966. The 65 focusable controls of the pinned dialog, drawer, menus and command lists cannot be reached by Tab.
- **Why it matters:** the tab that shows every overlay under a preset cannot be used from the keyboard. It also blinds any browser check that walks it.
- **Fix:** the one 03 finding 13 gives. Make each pinned stage `inert` except the one being tried, or pin one non-modal popup per stage. Here the overlays are a picture of the preset, so `inert` on every stage fits, as the landing hero does.

#### 5. Night and Console widen tables, and at 375 the landing showcase's row actions land on the scroll edge with their rings cut

- **Severity:** MEDIUM. **Kind:** bug. **Preset:** Night (5px), Console (1px). **Checkable:** yes, browser: the site check's focus-ring check already finds it, if it could run under a preset (add a `--preset` option that stores the choice before load).
- **Location:** the cause in the styles is `lib/presets/night-style.ts:54-58` (table heads `uppercase`, `letter-spacing: 0.06em`) and `lib/presets/console-style.ts:88-89` (uppercase mono table heads). The page is `components/site/landing-showcase.tsx:51-53` (ProjectsTable in a card). The clipping is the 03 finding 9 cause in `registry/kosmos/ui/scroll-area.tsx`.
- **What is wrong:** at 375 the Projects table is already 313px in a 307px viewport under Default. Night grows it to **324px** and Console to **320px**. The Columns trigger and all 10 "Actions for …" buttons then end at or past the viewport's right edge, and their rings are cut **5px** (Night) or **1px** (Console) on the right, in light and dark (11 cuts per load). Under Default and Soft the buttons end 10px inside the edge and nothing is cut.
- **Why it matters:** row actions are where a keyboard user acts on a project, and under two presets their focus ring is cut.
- **Fix:** 03 finding 9's fix (scroll the focused element fully into view inside `ScrollArea`), which covers every preset. No style change needed.

#### 6. Landing CTAs are links styled with `buttonVariants`, so presets treat them as links, not buttons (Fixed in ticket 29)

- **Severity:** LOW. **Kind:** bug. **Preset:** Iris and Night reach them. **Checkable:** yes, code: flag `className={buttonVariants(` on an element that is not `Button` (or require `data-slot="button"` beside it).
- **Location:** `app/(site)/(home)/page.tsx:44`, `:47`, `:73`, and `components/site/landing-pricing.tsx:27`, `:39` (`<Link className={buttonVariants({ variant: 'primary', size: 'lg' })}>`).
- **What is wrong:** these `<a>` elements carry no `data-slot="button"`, `data-variant` or `data-size`. Preset rules aimed at links therefore hit them: Iris's zero offset (finding 1, measured on "Get started"), and Night's `a:not([data-slot="button"]):focus-visible` drop-shadow glow (`night-style.ts:44-46`). Meanwhile a style's type rules for buttons miss them.
- **Why it matters:** ADR 0014 keeps buttons Kosmos under every preset, and these five are the landing's main actions.
- **Fix:** render them through the Button so they carry its data attributes: `<Button variant="primary" size="lg" nativeButton={false} render={<Link href=… />}>`. That keeps client navigation, which is why the comment at `page.tsx:43` avoids `Button href`.

#### 7. Landing showcase: screens scroll with `overflow-y-auto`, not ScrollArea

- **Severity:** LOW. **Kind:** bug (kosmos-style, Overflow). **Checkable:** yes, code: `overflow-(x|y)-auto` in `components/site`. The style's detection table already lists it.
- **Location:** `components/site/landing-showcase.tsx:130` (`landing-panel … overflow-x-hidden overflow-y-auto`) and `:51` (ProjectsScreen `overflow-y-auto`). This is the landing's own copy of 04 finding 13 (`blocks/showcase/showcase.tsx`).
- **What is wrong:** the panels cut content at the frame edge with no edge fade, the one Kosmos overflow cue.
- **Fix:** as 04 finding 13: wrap each screen in `ScrollArea`. Better, reuse the Showcase block once it is fixed rather than keeping a second copy.

#### 8. Presets Overlays tab: the pinned toast stack overflows its fixed-height stage at phone width (Fixed in ticket 22)

- **Severity:** LOW. **Kind:** bug. **Preset:** all. **Checkable:** yes, browser: text or a focusable element cut by an `overflow: hidden` ancestor (the 03 clipped-text measure, run on `/preset-preview`).
- **Location:** `components/preset-cards/overlay-cards.tsx:284` (`stageClassName="h-[21rem]"`).
- **What is wrong:** at 341 the toasts wrap to more lines. The front toast, "Ama Mensah joined Acme", starts **3px above** the stage, so its top edge is cut and its focus ring is cut 8px. At 966 it sits 71px inside. The card's description, "hover to spread them", also names an action a phone cannot do.
- **Fix:** `min-h-[21rem]` instead of a fixed height, or a taller stage below `sm`. Make the line "Stacked in the corner; point at them to spread them.", or drop the hint on touch.

#### 9. Iris: idle sidebar icons on the header block fall below 3:1

- **Severity:** LOW. **Kind:** taste (the icons sit beside text labels, so 1.4.11 does not require them). **Preset:** Iris, light. **Checkable:** yes, code: add `--iris-subtle` on `--iris-sidebar-block` to the preset contrast test.
- **Location:** `lib/presets/iris-style.ts:43` (`--iris-subtle: #8f8f8f`), `:40` (`--iris-sidebar-block: #f4f4f4`), `:153`.
- **What is wrong:** measured on the Dashboard tab and the landing hero sidebar: an idle nav item's icon `rgb(143,143,143)` on `rgb(244,244,244)` is **2.94:1**. On the white sidebar body it passes.
- **Fix:** darken `--iris-subtle` in light to `#8a8a8a` (3.14:1 on `#f4f4f4`, computed).
- **Triage:** not doing. The icons sit beside text labels, so no floor asks for 3:1, and the fix would change a preset palette value.

#### 10. Night: the current sidebar item drops the accent that its description and its navbar keep (Fixed in ticket 29)

- **Severity:** LOW. **Kind:** bug (the picker text misdescribes the preset). **Preset:** Night. **Checkable:** no.
- **Location:** `lib/presets/night-style.ts:47-50` (`[data-slot="sidebar-menu-button"][data-active] { color: var(--sidebar-foreground) }`); `lib/presets/night.ts:11-12` (description: "a mint accent that … colors focus, the current page in navigation and meters").
- **What is wrong:** measured on the Dashboard tab: Night's current sidebar item is `rgb(18,20,24)` in light and `rgb(243,245,249)` in dark, equal to `--sidebar-foreground`, while `--accent-text` is mint. Soft and Console color it with the accent. Night's navbar current item, which no rule overrides, keeps the accent, so the two navigations disagree. Iris does the same thing to its sidebar, but its description says so ("a raised key in ink").
- **Fix:** decide one. Either drop the `color` line, so the raised key keeps the accent text, or change the description to say what Iris's says.

#### 11. Landing stack: the React and Tailwind names fall below 4.5:1 on hover in light (Fixed in ticket 19)

- **Severity:** LOW. **Kind:** bug. **Checkable:** yes, code: check `stackBrandColors` against `background` in every preset in a `pnpm test` case.
- **Location:** `components/site/stack-brands.ts:3-4` (`react: '#149eca'`, `tailwind: '#06b6d4'`), shown through `logo-marquee.tsx:62` (`hover:text-(--logo-color)`). This is the landing's copy of 04 finding 5.
- **What is wrong:** measured at 1280 on hover: "React" **2.97:1** and "Tailwind CSS" **2.33:1** in light (16px, 600). Dark passes (5.94:1 and 7.59:1). These are brand names next to their marks, so 1.4.3's logotype exception may cover them. They still read faint on the page.
- **Fix:** in light, use the darker brand step or keep the mark colored and the name in `foreground`.

#### 12. Presets copy says a preset is a palette and a radius; under Soft, Console, Night and Iris it is also a style (Fixed in ticket 29)

- **Severity:** LOW. **Kind:** bug (the text understates what the code ships). **Checkable:** no.
- **Location:** `components/site/presets-view.tsx:49` ("Ready palettes and radii for the Kosmos tokens"); `app/(site)/(home)/presets/page.tsx:8-9` (metadata); `components/site/preset-code-dialog.tsx:92` ("The palette, radius and size you picked, in light and dark."); `:103` ("light on `:root`, dark on `.dark`").
- **What is wrong:** `presetCss` (`lib/presets/index.ts:48-56`) also writes an `@theme inline` block (type weights, tracking, motion) and the component rules. A visitor pasting Console's CSS gets mono table heads and a framed inset, which the dialog never mentions.
- **Fix:** "Ready palettes, radii and styles for the Kosmos tokens…"; dialog description "The preset you picked, its palette, radius, size and style, in light and dark."; CSS hint "Paste it after the Kosmos tokens in your global CSS."

#### 13. Landing showcase: tabs are not wired to their panels, and its headings skip a level

- **Severity:** LOW. **Kind:** bug. **Checkable:** yes, browser: every `[role=tab]` has an `aria-controls` that names a `[role=tabpanel]`; axe `heading-order` for the outline.
- **Location:** `components/site/landing-showcase.tsx:123-131` (hand-made `role="tabpanel"` divs with `aria-label` and no `id`; `TabsTrigger` without a `TabsContent`, so Base UI sets no `aria-controls`); `:18` and `:22` (`AppSidebar headingLevel={4}` before the page's `<h3>`).
- **What is wrong:** measured on `/`: the four tabs have `aria-controls` "-", and the panels have no `aria-labelledby`. At 1280 the outline under "Whole screens from the same blocks" (h2) runs h4 "Saved views", then h3 "Projects".
- **Fix:** give each panel an `id` and pass it to its trigger, or render the panels as `TabsContent keepMounted` with the cross-fade classes. Pass `headingLevel={3}` to the sidebar and make the page title an `h3` after it, or make the sidebar labels non-headings in this picture.

#### 14. Landing hero at 375: the picture's top bar holds only "Overview", with no sidebar trigger

- **Severity:** LOW. **Kind:** taste. **Checkable:** no.
- **Location:** `components/site/landing-hero-product.tsx:94-95`. This is the October hero item 2, still open, and the landing's copy of 04 finding 21's second half.
- **What is wrong:** measured at 375: the frame starts at y 373 and shows 384px. The sidebar is a closed drawer and the header has no trigger, so the phone hero reads as an app with no navigation.
- **Fix:** a visual `SidebarTrigger` (inert, like the rest) before the title, as 04 finding 21 proposes for the block.

#### 15. Presets page: the preview panel and its iframe are two separate Tab stops (Fixed in ticket 29)

- **Severity:** LOW. **Kind:** bug. **Checkable:** yes, browser: two consecutive Tab stops with the same box.
- **Location:** `components/site/presets-view.tsx:82` (`TabsContent keepMounted`, focusable by default) around the `iframe` at `:84`.
- **What is wrong:** the Tab walk on `/presets` (375 and 1280) goes Components tab, then the `div[tabs-content]` (343×576), then the `iframe` with the same box. The panel stop announces nothing useful.
- **Fix:** `tabIndex={-1}` on that `TabsContent`. The iframe is the focusable content, which is the APG case for leaving the panel out of the order.

### Kosmos style

Reported, not fixed:

- **Iris unchecked checkbox edge:** `border-color: #e0e0e0` on white (about 1.3:1 from the declared values, `iris-style.ts:132-137`). `better-accessibility` asks for 3:1 on a control boundary. It matches conflicts.md, Input boundary, and Default's `shadow-control` ring is no stronger.
- **Soft motion past 300ms:** overlay 320ms, slow 380ms, base 260ms (`soft-style.ts:38-40`). `better-ui` and Emil keep UI motion under 300ms. ADR 0014 lets a style set its motion, and Soft's summary says "Motion is a little slower".
- **Console sets `tabular-nums` on `body`:** every figure, prose included (`console-style.ts:71-73`). `better-typography` keeps prose figures proportional. It is Console's look ("a pro tool"), not a defect.

### October audit, re-checked in this scope

| October finding | Now |
| --- | --- |
| 2.3a Warm's chart series 2–5 multi-hue, the others a mono ramp | Superseded by ADR 0016: one five-hue chart palette for every preset. Dropped |
| 2.3b, 2.3c Pagination, Glow and Flickering grid in the accent | Settled in the rule (see 03). Dropped |
| 2.3d Preset descriptions do not say what the accent drives | Fixed: every description now lists what the accent fills and colors. One mismatch remains, Night's sidebar (finding 10) |
| 2.3e Accent only in focus and nav | Superseded by ADR 0011: the accent fills `primary` (buttons, switches, checkboxes, the tabs indicator). Measured: under Soft, Console, Night and Iris the current nav item and ring take the accent. Dropped |
| 2.6 Syntax colors in Get code don't fit black and white | Contrast measured in the Get code dialog under all 5 presets, light and dark: 5.42:1 (Iris light, string green on `#fafafa`) to 10.49:1. The hue question is settled by ADR 0016, since charts carry hue again and `code-themes.ts` derives from the chart and tag hues. Shiki's cream `editor.background` never shows: the block takes `bg-card`. Dropped |
| 3.1 Hero: scrollbar in the inert picture | Fixed on the landing: 0 visible scrollbars at 1280 and 375. The block still has it (04 finding 21) |
| 3.2 Hero at 375: header with only "Overview" | Still present: finding 14 |
| 3.3 Hero at 1280×900 shows no chart in the first screen | Frame top 457px; 406px of the picture in the first screen at 900, 306px at 800. The taller 46rem frame (`app/global.css:87-91`) is deliberate. Taste, dropped |
| 5 Sweep of `/` and `/presets` | 0 overflow, focus-ring or console findings on either page (site check, 8 loads) |

### Verification

Passed or clean:
- `pnpm site-check --port 3010 --route /presets --workers 2`: 0 findings, 4 loads. `checkPage` on `/`: 0 findings, 4 loads.
- Matrix (140 loads): no text below 4.5:1, no nameless control, no oval shape, no text spilling out of a button, badge or tab, and no invisible focus stop, under any preset. The only overflow is finding 2. On `/` the Tab walk reached 103 stops at 1280 and 83 at 375 with no ring cut under Default, Soft and Iris.
- Focus-all at 966 light: no ring cut, rounded clip corners included, on Components, Dashboard, Forms and Overlays under any preset. This includes Soft's 26–28px dialog radius and Console's `overflow: clip` inset.
- Phone Preset drawer, every preset: no overflow, `sr-only` names stay inside, focus moves in on open, Escape closes. Header popover and Get code dialog: no overflow, no text below 4.5:1.
- Landing motion: the hero rise, blur and section reveals collapse to opacity under `prefers-reduced-motion` (`landing-motion.css:16-24`). The gallery stages stop under reduced motion and have a pause button (`gallery.tsx:66-73`).

Discarded measurements (checked by hand):
- The hero title "cut 6px" by `section[data-slot=hero-product]` at 1280 is the font's content box above the 1.1 line box, not glyph ink. It is **Not verified** for a translated title with tall diacritics.
- The focus-all "merge" rows on Select triggers: text fields draw their own ring line (`conflicts.md`, Focus indicator), not the outline.
- Focus-all cuts at 341 on "Unassigned", "No target" and "Live": these controls were off-screen in a scroll area because the probe focused with `preventScroll`. A real Tab scrolls them in, and they appear under Default too.
- The 1px focus guard `span` cut on the Overlays tab: part of finding 4.

Tool note for the site check (ticket 01): `--route /` selects every route, because `siteRoutes` strips the trailing slash and matches `startsWith('/')`. A run started with it went through all 327 routes before it was stopped. Fixed in ticket 15.

**Not verified:** 200% zoom and 320px reflow, RTL, forced colors, a real screen reader, the picker's non-default choices (accent off, other radii, Compact and Comfortable), Warm, and full-motion playback.

Tool note for the site check (ticket 16): `--check clipped-text` and `--check names` and the edge-fade test in `focus-ring` measure the checkable half of Blocks 3 and 14, Landing 8, Components 8, Blocks 4 and Docs 3. Fixed in ticket 16.
