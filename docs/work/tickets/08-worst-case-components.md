# 08: Worst case: components

**What to build:** Every component that renders user data (table, data table, lists, cards, stat card, bar list, avatar, badge, tags input, breadcrumb, pagination, notification inbox, charts and the like) holds up with its worst realistic data: long names, unbreakable emails, one-letter names, missing fields, huge counts, zero items, long labels, non-Latin text, emoji and extreme numbers. `break-ui` finds what breaks, the agent fixes it without showing the maintainer, and the worst-case data stays in each item's review preview for good. Spec: `docs/work/audit-spec.md`.

**Blocked by:** 07 (Triage the audit) and the fix tickets it created: 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31.

**Model:** Sonnet

**Status:** ready-for-agent

- [ ] `break-ui` runs on every item in scope; the PR lists each item and what broke.
- [ ] Every break is fixed in the item, following the style skill (min-w-0, truncate or line-clamp with the full text reachable, numbers never truncated, tabular-nums).
- [ ] Each item's review preview (`/view/<name>`) gets the Demo data / Worst case toggle with the worst-case dataset, and keeps it.
- [ ] Docs demos keep their normal sample data.
- [ ] Worst-case data follows the demo world of the style skill.
- [ ] The site check (ticket 01) passes on every touched review preview, both datasets.
- [ ] A changelog entry for each fix that changes what a user installs.
- [ ] `GLOSSARY.md` gains **worst-case data** (in whichever of 08 and 09 lands first).
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
- [ ] Split into several PRs by item group if one context window cannot hold it.
