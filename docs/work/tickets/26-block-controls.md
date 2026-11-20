# 26: Block controls keep focus and do what they say

**What to build:** In blocks, a control never drops keyboard focus to the page when it removes or disables itself, never does nothing by default, and never pretends to be a link. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Blocks 8 (focus drops to `<body>`), Blocks 12 (controls that do nothing; the Run timeline part is in ticket 24), Blocks 17 (notification titles are links that never navigate), and from Blocks 27: the wrong item marked current, the hard-coded `aria-keyshortcuts`, `NumberField` with no `locale`, mixed heights in one row.

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/blocks/`: `navbar`, `dashboard-analytics`, `dashboard-crm`, `settings`, `members`, `app-sidebar`; `registry/kosmos/examples/app-sidebar-demo.tsx`, `error-page-500.tsx`; lint.

- [ ] Focus follows the PageHeader chip pattern (`page-header.tsx`, about lines 143-157): after a row removes itself, focus goes to the next row, else the list or its tab. This covers the dashboards' "Mark all as read" and the notification row actions.
- [ ] Navbar banner: on dismiss, focus moves to the bar's home link.
- [ ] Settings Save and Members Send invite: `focusableWhenDisabled` on the Button that disables itself. Settings Discard, which unmounts, moves focus to Save.
- [ ] Each case is checked with a scripted keyboard walk (activate, then `document.activeElement !== document.body`), listed in the PR. No lasting check: the site check cannot know which control removes itself.
- [ ] Each action renders only when its handler or `href` is passed: App sidebar Search (`onSearch`), the CRM task buttons (`onTaskAction`). The demos pass handlers so their buttons still show.
- [ ] The 500 docs example's "Try again" calls `location.reload()`.
- [ ] A lint rule flags `onClick={() => {}}` in `registry/kosmos/blocks` and in docs examples, with a flagged and an allowed snippet in `lib/code-checks.test.mts`, named in the style skill.
- [ ] Notifications: `DashboardNotification` takes `href?: string`; with no `href` the title renders as a `<button type="button">`.
- [ ] Analytics and CRM mark their own nav item current, not "Overview".
- [ ] Navbar: `aria-keyshortcuts` is built from the `shortcut` prop.
- [ ] Settings: the `NumberField` takes `locale="en-US"`. A lint rule flags a `NumberField` with no `locale` in blocks and examples.
- [ ] Members: the invite select takes the height of the Button beside it (style skill, Buttons: a field beside a Button takes the Button's height).
- [ ] A changelog entry for each changed block.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
