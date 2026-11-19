# 05: Audit: docs site

**What to build:** The maintainer gets a ranked list of every interface flaw in the docs site itself: navigation, sidebar, search, the docs pages and their prose, code blocks, the changelog and the not-found page, in the shared findings list. `better-interface` runs the review and loads its `better-*` domain skills; the site check (ticket 01) supplies the runtime measurements. No screenshots. Spec: `docs/work/audit-spec.md`.

**Blocked by:** 01 (Site check command).

**Model:** Opus

**Status:** ready-for-agent

- [ ] `better-interface` reviews the whole scope in light and dark, at 375 and 1280, with the Default preset, including empty, loading, error and narrow states where they exist, and states the scope it covered and anything it left out.
- [ ] Runtime evidence comes from the site check and the shared site helper, never from screenshots.
- [ ] The October audit's open findings in this scope are re-checked: still broken goes in, fixed is dropped.
- [ ] Findings go in the "Docs site" section of `docs/work/audit.md` (created by whichever audit ticket runs first), each with location, what is wrong, why it matters, the fix, severity, and **bug** or **taste**.
- [ ] A cause shared by many places is one finding listing all its locations, reported against the shared source (a token, a base component, a style skill rule).
- [ ] Findings that disagree with the style skill go under "Kosmos style" and are not fixed.
- [ ] Findings a machine could detect are marked **checkable**, with the kind of check (code or browser).
- [ ] No source file changes. The list is committed straight to `dev` (docs/work only).
