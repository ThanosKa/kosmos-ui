# 06: Audit: landing and Presets

**What to build:** The maintainer gets a ranked list of every interface flaw on the landing page and the Presets page, and of every flaw a style preset (Soft, Console, Night, Iris) brings to any component. The Presets page shows every component under one preset, so the style pass runs there. `better-interface` runs the review; the site check (ticket 01) supplies the runtime measurements. No screenshots. Spec: `docs/work/audit-spec.md`.

**Blocked by:** 01 (Site check command).

**Model:** Opus

**Status:** ready-for-agent

- [ ] `better-interface` reviews the landing page and the Presets page (every tab) in light and dark, at 375 and 1280, with the Default preset, and states the scope it covered and anything it left out.
- [ ] A second pass runs the Presets page under each style preset, in light and dark, and records what each style breaks: clipped rings, shapes, contrast, overflow.
- [ ] Runtime evidence comes from the site check and the shared site helper, never from screenshots.
- [ ] The October audit's open findings in this scope (accent contract, syntax colors, hero) are re-checked: still broken goes in, fixed is dropped.
- [ ] Findings go in the "Landing and Presets" section of `docs/work/audit.md` (created by whichever audit ticket runs first), each with location, what is wrong, why it matters, the fix, severity, and **bug** or **taste**; style preset findings name the preset.
- [ ] A cause shared by many places is one finding listing all its locations; a cause in a preset's style is reported against that style.
- [ ] Findings that disagree with the style skill go under "Kosmos style" and are not fixed.
- [ ] Findings a machine could detect are marked **checkable**, with the kind of check (code or browser).
- [ ] No source file changes. The list is committed straight to `dev` (docs/work only).
