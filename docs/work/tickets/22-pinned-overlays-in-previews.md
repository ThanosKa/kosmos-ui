# 22: Pinned overlays in previews

**What to build:** A review preview or a Presets preview tab that pins menus, dialogs and drawers open can be walked from the keyboard without a stack overflow or a focus trap, so the site check measures the whole page. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Components 13, Blocks 9 and Landing 4 (one cause: popups pinned `open` with `modal={false}` and no `onOpenChange`; Base UI's `FloatingFocusManager` and `FloatingPortal` focus guards hand focus back and forth until "Maximum call stack size exceeded"); Landing 8 (the pinned toast stack overflows its fixed-height stage at 341, same Overlays tab).

**Blocked by:** 15 (the site check visits `/preset-preview`).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `components/preview/overlay-stage.tsx`; `registry/kosmos/examples/`: `breadcrumb`, `dropdown-menu`, `app-sidebar`, `page-header`, `detail-drawer`, `navbar`; `components/preset-cards/overlay-cards.tsx`, `block-cards.tsx`.

- [ ] Reduce the loop to a minimal repro first (likely two Base UI menus held `open` with `modal={false}` on one page) and put it in the PR body, so the maintainer can report it to Base UI.
- [ ] Review previews: a pinned menu stays reviewable by keyboard. Pin it with a controlled `open` and an `onOpenChange` that ignores only the `focus-out` and `outside-press` reasons. If that does not stop the loop, make every `OverlayStage` that is not under review `inert` (in `components/preview/overlay-stage.tsx`, so one change reaches every preview).
- [ ] Presets preview Overlays tab: the overlays are a picture of the preset, so every pinned stage is `inert`, as the landing hero is.
- [ ] Toast stage: `min-h-84` in place of the fixed `h-[21rem]` (`overlay-cards.tsx`, about line 284). Its line reads "Stacked in the corner; point at them to spread them."
- [ ] `pnpm site-check` reports no console error and no focus guard `span` on `/view/breadcrumb`, `/view/dropdown-menu`, `/view/app-sidebar`, `/view/page-header`, `/view/detail-drawer`, `/view/navbar` and `/preset-preview` (Overlays), light and dark, both widths.
- [ ] Re-run the site check on `/view/app-sidebar` at 1280, which the trap stopped before. List what it now finds in the PR; fix it here if it is in this ticket's files, else name the ticket that owns it.
- [ ] `pnpm lint`, `pnpm types:check` and `pnpm test` pass.
