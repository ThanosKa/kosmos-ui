# 12: Remaining code checks

**What to build:** The mistakes agents are known to make that no fix ticket guards yet fail `pnpm lint`, each rule tested the way ticket 02 set up. Spec: `docs/work/audit-spec.md`.

**Blocked by:** 02 (Scroll focus ring inside overlays).

**Model:** Sonnet

**Status:** ready-for-agent

- [ ] A rule for each of these that no fix ticket already covers: a sticky header with a translucent fill; an icon-only Button with no accessible name; an arbitrary pixel value in a component where a spacing unit belongs; a ported item without its third-party notice (ADR 0010); a key-like string in demo data.
- [ ] Each rule's message names the fix and cites the style skill.
- [ ] Each rule has a flagged and an allowed snippet in the lint test from ticket 02.
- [ ] Code that breaks a new rule today is fixed in the same PR, or the rule waits for the fix ticket that covers it.
- [ ] The style skill names each check beside the rule it guards.
- [ ] `pnpm lint`, `pnpm types:check` and `pnpm test` pass.
