# 07: Triage the audit

**What to build:** The findings list becomes fix tickets an agent with no context can execute. Bugs become tickets at once; taste findings wait for the maintainer, who picks which to do. Spec: `docs/work/audit-spec.md`.

**Blocked by:** 03, 04, 05, 06 (the four audits).

**Model:** Opus

**Status:** ready-for-agent (stops for the maintainer's pick)

- [ ] Findings across the four sections are merged where they share a cause, so one fix reaches every place.
- [ ] Every **bug** becomes a fix ticket (or joins one with the same cause), numbered after the last ticket in this folder.
- [ ] The **taste** findings go to the maintainer as one short list, in plain words, each with the proposed change; the session stops until the maintainer picks.
- [ ] Every picked taste finding becomes a fix ticket; the rest are marked "not doing" in the findings list.
- [ ] Each fix ticket names the finding, what to build, acceptance criteria, its blockers, **Model: Sonnet**, and, when the finding is **checkable**, the code or browser check that ships in the same PR.
- [ ] Each fix ticket is small enough for one fresh context window and one reviewable PR.
- [ ] Tickets 08 and 09 list the new fix tickets in their "Blocked by".
- [ ] Committed straight to `dev` (docs/work only).
