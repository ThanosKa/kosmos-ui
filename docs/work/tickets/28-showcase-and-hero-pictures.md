# 28: Showcase and hero pictures

**What to build:** The Showcase block, the landing showcase and the hero pictures scroll with ScrollArea and its edge fade, wire their tabs and headings correctly, and show a phone header that has a way to the navigation. Each fix lands in the block and in the landing's own copy. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Blocks 13 and Landing 7 (screens scroll with `overflow-y-auto`, not ScrollArea), Landing 13 (landing showcase tabs not wired to their panels; headings skip a level), Blocks 21 and Landing 14 (HeroProduct: a scrollbar in the inert picture; no sidebar trigger at 375), and from Blocks 27: the duplicate "Main" landmark, the showcase's `h3` above `h2`s, app page titles in `text-body`, HeroProduct's props on the wrong element.

**Blocked by:** 16 (`--route /` and the `clipped-text` check prove the fix).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/blocks/showcase/`, `registry/kosmos/blocks/hero/hero-product.tsx`, `registry/kosmos/blocks/app-sidebar/` (`navLabel` only); `components/site/landing-showcase.tsx`, `components/site/landing-hero-product.tsx`; `registry/kosmos/examples/app-sidebar.tsx`, `app-sidebar-demo.tsx` (title size only); lint.

- [ ] Each Showcase and landing showcase screen scrolls in `ScrollArea` with a focusable viewport and keeps `-outline-offset-2` on the root. It keeps its full height: ScrollArea broke that before (backlog), so size it as the Kanban board does (`min-h-0 flex-1` on the root, `viewportClassName="[&>[data-slot=scroll-area-content]]:h-full"`).
- [ ] A lint rule flags `overflow-auto`, `overflow-x-auto` and `overflow-y-auto` in `registry/kosmos/blocks` and `components/site` (style skill detection table), with a flagged and an allowed snippet in `lib/code-checks.test.mts`, named in the style skill. Ticket 30 adds the same rule for `components/docs`; whichever lands second joins the two into one rule.
- [ ] Landing showcase tabs: panels render as `TabsContent keepMounted` with the cross-fade classes, so Base UI wires `aria-controls` and `aria-labelledby`.
- [ ] Headings: the landing showcase passes `headingLevel={3}` to AppSidebar and its page title is an `h3`; the Showcase block's screen title sits one level above the headings of the blocks inside it.
- [ ] App page titles in the Showcase and the App sidebar previews take `text-title font-medium`, as the dashboards do.
- [ ] AppSidebar takes `navLabel` (default "Main"); the Showcase block and the landing showcase pass `navLabel="App"`, so the page has no two landmarks named "Main".
- [ ] HeroProduct: `[&_[data-slot=scroll-area-scrollbar]]:hidden` on the inert wrapper; `{...props}` and `className` land on the same outer element.
- [ ] Hero pictures (block and landing): a `SidebarTrigger` before the title in the picture's header, inert like the rest of the picture.
- [ ] Measured: no visible scrollbar in `/view/hero-product` at 1280, the landing's tabs have `aria-controls` naming a `tabpanel`, the heading outline under "Whole screens from the same blocks" has no skipped level, and `pnpm site-check --route /view/showcase --route /view/hero-product --route /` reports no `focus-ring` or `clipped-text` finding.
- [ ] A changelog entry for Showcase, HeroProduct and AppSidebar.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
