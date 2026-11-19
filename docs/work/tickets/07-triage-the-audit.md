# 07: Triage the audit

**What to build:** The findings list becomes fix tickets an agent with no context can execute. No step waits for the maintainer: the style skill settles taste, and the maintainer reviews the PRs. Spec: `docs/work/audit-spec.md`.

**Blocked by:** 03, 04, 05, 06 (the four audits).

**Model:** Opus

**Status:** ready-for-agent

- [ ] Findings across the four sections are merged where they share a cause, so one fix reaches every place.
- [ ] Every **bug** becomes a fix ticket (or joins one with the same cause), numbered after the last ticket in this folder.
- [ ] Every **taste** finding that agrees with the style skill becomes a fix ticket. One that would change a Kosmos value, or that the style skill does not settle and that is a matter of preference only, is marked "not doing" in the findings list with the reason.
- [ ] Each fix ticket names the finding, what to build, acceptance criteria, its blockers, **Model: Sonnet**, and, when the finding is **checkable**, the code or browser check that ships in the same PR.
- [ ] Each fix ticket is small enough for one fresh context window and one reviewable PR.
- [ ] Tickets 08 and 09 list the new fix tickets in their "Blocked by".
- [ ] Committed straight to `dev` (docs/work only).
