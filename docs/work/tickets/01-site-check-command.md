# 01: Site check command

**What to build:** A command the maintainer runs against a dev server that opens every docs and site page and every review preview at 375 and 1280 wide, in light and dark, and reports each page that scrolls sideways, each focus ring cut by a clipping ancestor, and each console error. It exits with a failure when it finds one that is not on its known-exceptions list. It is the measuring tool the audit tickets use, and the browser check CI runs later (ticket 13). Spec: `docs/work/audit-spec.md`.

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Status:** ready-for-agent

- [ ] One command, named like the other site scripts, built on the shared site helper that `pnpm screenshots` uses, taking the same port and base options.
- [ ] It walks every docs and site page and every review preview, read from the registry and the docs source, not a hand-kept list.
- [ ] It reports horizontal overflow at 375: the page's scroll width larger than the viewport, with the overflow in pixels.
- [ ] It reports a focus ring cut by an ancestor whose overflow is not visible, by tabbing through each page and comparing the ring box (outline plus offset, or a spread shadow) with each clipping ancestor, naming the element, the clipper and the side cut.
- [ ] It reports console errors and page errors per page.
- [ ] It can run one check alone and one route or group of routes alone, so an agent can re-check a fix fast.
- [ ] A known-exceptions list, each entry with the reason, keeps a deliberate exception from failing it.
- [ ] Its output names the route, theme, width, check and detail, one line per finding, and ends with a count.
- [ ] Run once on `dev`: the findings are listed in the PR body (they become audit input, not fixes in this ticket).
- [ ] `GLOSSARY.md` gains **browser check** in this PR.
- [ ] `pnpm lint`, `pnpm types:check` and `pnpm test` pass.
