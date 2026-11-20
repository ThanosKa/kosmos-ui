# 33: Worst-case leftovers

**What to build:** The site check passes on the Kanban board, Command menu and New item dialog review previews in both datasets. Ticket 09 left three findings that do not come from the data. Spec: `docs/work/audit-spec.md`.

**Blocked by:** 08 (Worst case: components).

**Model:** Sonnet

**Touches:** Kanban board, `OverlayStage`, ScrollArea.

**Status:** ready-for-agent

- [ ] Kanban at 375: the focus ring of a card in the Ideas column is no longer cut on the left (7px today, in both datasets), nor under the edge fade on the right with worst-case data.
- [ ] Command menu and New item dialog, worst-case dataset: the 1px "span cut" focus-ring finding in the first, non-modal overlay stage is gone (likely a Base UI focus guard reached only by that run), fixed in the stage or the component, not by an exception.
- [ ] ScrollArea content no longer sizes to its widest child where that pushed the Kanban card and the New item dialog past their frames, unless ticket 08 already fixed it; then the block workarounds from ticket 09 are removed if no longer needed.
- [ ] `pnpm site-check --workers 1` on the three previews, `?data=worst` and demo, light and dark, 375 and 1280: 0 findings.
- [ ] A changelog entry if what a user installs changes.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` for changed items pass.
