# 31: Block copy and docs prose

**What to build:** Blocks name each thing one way, start labels with a verb, say what failed and what to do next, and use the demo world's data; the docs prose passes Vale with no warning, and the sentence-length rule becomes an error so it stays that way. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Blocks 26 (the same thing worded two ways, labels that miss; its "vs." wording is in ticket 27), Blocks 25 (only `title.toLowerCase()` in the Page header search placeholder), Blocks 27 (demo data off the demo world), Docs 15 (59 Vale warnings in `content/docs`).

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/blocks/`: `dashboard-analytics`, `dashboard-crm`, `page-header`, `command-menu`, `app-sidebar`, `bento`, `kanban-board`, `members`, `settings`, `hero`; the Bento docs example; `.claude/skills/kosmos-style/demo-world.md`; `content/docs/**`; `.vale.ini` or `.vale/styles/Kosmos/SentenceLength.yml`.

- [ ] One term per thing: "You’re all caught up" in both dashboards; "Clear filters" in Page header (not "Clear all"); "Search…" in Command menu and App sidebar.
- [ ] CRM: the button reads "New deal"; the task buttons' `aria-label` is "Call Copperline Bank", not "Call: Call Copperline Bank".
- [ ] Analytics range items "7d", "30d", "90d" carry a spoken name ("Last 7 days", …).
- [ ] Command menu: no `No results for “”` on an empty query.
- [ ] Bento: `linkLabel` is required on each tile (types enforce it), so no tile falls back to "Learn more"; each sample tile names its link.
- [ ] Kanban: an empty board and a filtered board with no match say different things; only the empty one says "Drag a card here to plan it".
- [ ] Members: the invite error points at the invalid addresses by their error text, not "in red".
- [ ] Settings danger zone: each action says what happened when it succeeds, and a failure names the cause and the next step instead of "That did not work. Try again."
- [ ] Page header: the search placeholder keeps the title's case ("Search Q4 roadmap").
- [ ] Demo world: Lena Park's bio says Product lead (`settings.tsx`); the Hero's sample announcement and the Bento docs example follow `demo-world.md` (Marketing site). A value the demo world lacks is added to `demo-world.md` in this change.
- [ ] `pnpm prose` reports no warning in `content/docs` (split long sentences, make passives active, drop "quick motion" in `index.mdx`), then `Kosmos.SentenceLength` is `error` for `content/docs` (a section in `.vale.ini` if the rule also reads other files that still warn). Use the `technical-writing` skill.
- [ ] A changelog entry for each changed block, naming the Bento `linkLabel` change.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
