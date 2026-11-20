# 11: Motion plans

**What to build:** The maintainer gets a prioritized audit of every animation that remains, and each fix worth making becomes a ticket a Sonnet agent can execute with no taste of its own. Emil's `improve-animations` writes the audit and the plans; it changes no source. Spec: `docs/work/audit-spec.md`.

**Blocked by:** 33 (Worst-case leftovers).

**Model:** Opus

**Status:** ready-for-agent

- [ ] `improve-animations` surveys the motion of every component, block and site page.
- [ ] The motion findings join `docs/work/audit.md` in a "Motion" section, ranked.
- [ ] Each fix worth making becomes a ticket with exact values (property, duration, easing, origin, reduced-motion behavior), **Model: Sonnet**, and its blockers.
- [ ] Every value matches the style skill's motion table, or the finding is marked "Kosmos style" and gets no ticket.
- [ ] Each motion fix ticket says that `review-animations` reviews its diff.
- [ ] Ticket 13 lists the new motion tickets in its "Blocked by".
- [ ] No source file changes. Committed straight to `dev` (docs/work only).
