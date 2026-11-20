# 15: Site check fixes

**What to build:** The site check reports only real flaws and visits every page. `--route /` checks the landing page alone, a spread shadow an element already wears at rest no longer counts as its focus ring, and the Presets preview document (`/preset-preview`) is visited on each of its five tabs. Spec: `docs/work/audit-spec.md`.

**Findings:** the three site check bugs the audits ran into (`docs/work/audit.md`: Landing and Presets, Verification, "Tool note"; Docs 5, the check half; Landing 2 and 4 need the preview visited).

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `lib/site-check.ts`, `lib/site-check.test.mts`, `scripts/site-check.mts`; `components/site/preset-preview-document.tsx` only if the tab is picked by URL.

- [ ] `--route /` selects `/` alone. `--route /docs` still selects `/docs` and every route under it. `siteRoutes` in `lib/site-check.ts` strips the trailing slash and so matches every route today; a test in `lib/site-check.test.mts` covers both cases.
- [ ] The focus-ring check counts the outline and only the shadows that change on focus. Read each focusable element's computed `box-shadow` before the Tab walk starts, and during the walk ignore a shadow the element already had at rest. A text field's focus line, a ring shadow that appears on focus, still counts.
- [ ] Two fixtures in `lib/site-check.test.mts`: an element with a resting `0 0 0 1px` shadow inside an `overflow: hidden` parent and an inside outline gives no finding; an element whose ring shadow appears on focus and is cut gives one.
- [ ] The check visits `/preset-preview` once per tab (Components, Dashboard, Forms, Overlays, Tokens), at 341 and 966 wide, the widths the Presets page iframe gives it on a 375 and a 1280 page. Pick the tab by posting the message the Presets page sends (`{ source: 'kosmos-site', type: 'page', … }`, see `usePreviewFrame`), or by a `?page=` parameter the preview reads. Each finding names the tab, for example `/preset-preview (overlays)`.
- [ ] A run on the integration branch no longer reports the 79 docs sidebar findings ("cut by `div.h-(--collapsible-panel-height)` right 1px"). The PR body lists the counts before and after, per check.
- [ ] Findings that are real flaws stay findings; they are not added to `scripts/site-check-exceptions.mts` (the fix tickets clear them).
- [ ] `pnpm lint`, `pnpm types:check` and `pnpm test` pass.
