# 16: Site check: clipped text, unnamed controls and focus under the edge fade

**What to build:** The site check catches three more flaws the audits measured by hand: text cut by a container that does not scroll, a control or popup with no accessible name, and a focused element left under a scroll area's edge fade. The fix tickets after it use these checks to prove their fix, and the worst-case tickets (08, 09) run them on every preview. Spec: `docs/work/audit-spec.md`.

**Findings:** the checkable half of `docs/work/audit.md` Blocks 3 and 14 and Landing 8 (clipped text), Components 8 and Blocks 4 (unnamed popups and fields), Docs 3 (focus under the fade).

**Blocked by:** 15 (Site check fixes).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `lib/site-check.ts`, `lib/site-check.test.mts`, `scripts/site-check.mts`.

- [ ] A `clipped-text` check: visible text whose box runs past an ancestor with `overflow` other than `visible` that does not scroll (its scroll size equals its client size). It skips text at opacity 0, `sr-only` text, `hidden="until-found"` content, and text that truncates on purpose (`text-overflow: ellipsis` or `-webkit-line-clamp` on the text's own element). It names the text, the clipper, the side and the pixels.
- [ ] A `names` check: from Playwright's ARIA snapshot, a `button`, `link`, `textbox`, `combobox`, `listbox`, `dialog`, `checkbox`, `switch`, `slider`, `tab` or `menuitem` with no accessible name.
- [ ] The `focus-ring` check also fails when the focused element's ring box overlaps an edge of a `[data-slot=scroll-area-viewport]` whose fade is active on that edge (the viewport's `--scroll-area-overflow-*` value for that edge is above 0).
- [ ] `--check` accepts `clipped-text` and `names`.
- [ ] Each new check has a fixture it flags and one it passes in `lib/site-check.test.mts`.
- [ ] Prior art: the October scripts in `.scratch/audit/` (main checkout) and the false positives each audit section lists under "Discarded measurements" in `docs/work/audit.md`; none of those may come back as findings.
- [ ] One run on the integration branch; the PR body lists the new findings. They are not added to the known-exceptions list: the fix tickets clear them.
- [ ] `GLOSSARY.md`'s **browser check** entry still matches what the command does.
- [ ] `pnpm lint`, `pnpm types:check` and `pnpm test` pass.
