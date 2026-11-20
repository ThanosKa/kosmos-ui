# 23: Timing and reduced motion

**What to build:** Nothing moves for a reader who asked for reduced motion, nothing blinks forever, and no toast with an action vanishes before it can be used. The style skill (Reduced motion is mandatory) calls a missing motion gate a blocking bug. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Components 6 (the unread dot scales under reduced motion), Components 11 (the Sonner docs hero's Undo toast closes after 4 seconds, WCAG 2.2.1), Components 12 (Flickering grid flickers with no way to stop it, WCAG 2.2.2), Docs 13 (the block viewer's width jumps under reduced motion).

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/ui/notification-inbox.tsx` (the dot only), `registry/kosmos/examples/sonner-demo.tsx`, `registry/kosmos/ui/flickering-grid.tsx` and `content/docs/components/flickering-grid.mdx`, `components/docs/block-viewer-panels.tsx`; lint.

- [ ] Notification inbox: `motion-safe:scale-50` in place of `scale-50` on the unread dot; the opacity fade stays.
- [ ] Sonner demo: `duration: Infinity` on the toast with the Undo action, as the docs' own rule says.
- [ ] Flickering grid: it flickers for 5 seconds after it first comes into view, then eases to its still pattern (`stillOpacity`) and stays still. Reduced motion keeps the still pattern from the start, as now. The docs page says so.
- [ ] Block viewer: under `motion-reduce:` the frame fades out and back in around the width change (`transition-[opacity]`), as the code block's expand does (`code-block.tsx`).
- [ ] Three lint rules, each with a flagged and an allowed snippet in `lib/code-checks.test.mts` and named in the style skill: a `scale-*` utility outside `motion-safe:` in a class list whose `transition-[…]` names `scale` (the press scale string excepted); `motion-reduce:transition-none` in `components/` and `registry/`; a Sonner `toast(…, { action })` with no `duration: Infinity`, or a Base UI `toast.add` with `actionProps` and no `timeout: 0`.
- [ ] Emil's `review-animations` reviews the diff before the PR opens; its findings are fixed or listed as Kosmos style.
- [ ] A changelog entry for Notification inbox and Flickering grid.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
