# 18: Focus stays in view inside scroll areas

**What to build:** A keyboard user always sees the control they focus. ScrollArea scrolls a focused element fully into view and clear of its edge fade, the sidebar resize handle's focus line is whole, and the docs sidebar's current item keeps its edge. One fix in ScrollArea reaches every table, tab list and scrolling sidebar, under every preset. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Components 9, Blocks 10, Landing 5 (focused control half hidden past the scroll edge); Docs 3 (focus stops inside the 2rem edge fade); Blocks 22 (resize handle line cut); Docs 5 (the layout half: the dark current item's ring cut by its group panel).

**Blocked by:** 16 (its focus-under-the-fade check proves this fix).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/ui/scroll-area.tsx`, `registry/kosmos/ui/sidebar.tsx` (resize handle only), `components/docs/docs-sidebar.tsx`.

- [ ] `ScrollArea`: on `focusin` inside the viewport (capture), when the target's box is not fully inside the viewport, call `target.scrollIntoView({ block: 'nearest', inline: 'nearest' })`. Chrome does not scroll an element that is already partly visible, which is the cause.
- [ ] `ScrollArea`: the viewport's scroll padding matches the edge fade (2rem) on each axis that fades, in place of `scroll-p-1`, so a focused item stops clear of the fade. Tab lists, tables, menus and the sidebar still scroll as before.
- [ ] Sidebar resize handle: inset 2px top and bottom (`inset-y-0.5`), so `sidebar-wrapper`'s clip no longer cuts its 4px focus line.
- [ ] Docs sidebar: `pe-px pb-px` on the group panel's `SidebarMenu` (`docs-sidebar.tsx`, about line 230), so the dark current item's `shadow-control` keeps its 1px ring.
- [ ] `pnpm site-check` reports no `focus-ring` finding on `/view/table`, `/view/data-table`, `/view/dashboard-crm`, `/view/dashboard-analytics`, `/view/sidebar`, `/`, `/docs/components` and `/docs/blocks`, light and dark, 375 and 1280.
- [ ] A changelog entry for ScrollArea and for Sidebar.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
