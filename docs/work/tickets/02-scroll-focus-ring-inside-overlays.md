# 02: Scroll focus ring inside overlays

**What to build:** A scrolling list inside a Dialog or Drawer (the Dialog scroll example, a long Drawer body) draws its keyboard focus ring inside its own edge, as Kosmos style asks wherever a container would cut or crowd a ring, instead of onto the overlay's edges. A lint rule stops it coming back, and that rule is the first with a test, which sets the pattern every later code check follows. Spec: `docs/work/audit-spec.md`.

**Blocked by:** None (can start immediately).

**Model:** Opus

**Status:** ready-for-agent

- [ ] The focus ring of a focusable scroll area inside an overlay body sits inside its edge in light and dark, under the Default preset and each style preset.
- [ ] Scroll areas elsewhere keep their ring where it reads well today, unless the same problem shows there.
- [ ] Every Dialog and Drawer body still leaves room for the ring of its last focusable child (the October audit's Delete workspace dialog case stays fixed).
- [ ] A lint rule flags the pattern that caused this, with a message that names the fix and cites the style skill.
- [ ] A test inside `pnpm test` runs ESLint on one snippet the rule must flag (with its message) and one it must allow. The test is written so later rules add a pair of snippets, not a new harness.
- [ ] The style skill names the check beside the rule it guards.
- [ ] A changelog entry if what a user installs changes.
- [ ] `GLOSSARY.md` gains **code check** in this PR.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
