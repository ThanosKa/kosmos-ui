# 34: Icon swaps and small marks

**What to build:** Every icon that swaps for another in place (Send to Stop, Copy to Check, a new Status icon) moves the same way, and the unread dot fades without shrinking. The recipe is written into the style skill and guarded by lint, so ticket 36 and later agents reuse it. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Motion 2 (Status and Prompt composer grow from `scale-80`; Assistant message's copy swap leaves in 300ms) and Motion 5 (the unread dot grows and shrinks).

**Blocked by:** None. Runs beside 35 (no shared file).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/ui/status.tsx`, `prompt-composer.tsx`, `assistant-message.tsx`, `notification-inbox.tsx`; `content/docs/components/status.mdx`, `prompt-composer.mdx`; `.claude/skills/kosmos-style/SKILL.md`, `conflicts.md`; `eslint.config.mjs`, `lib/code-checks.test.mts`; one changelog entry.

Written at commit `4c91ba8`. If a quoted line no longer matches the code, stop and report instead of improvising.

## The recipe

Copy it from `registry/kosmos/ui/asset.tsx:136-139` and `:252-255`, which already follows it:

- Both icons sit in one cell, `<span aria-hidden className="grid *:col-start-1 *:row-start-1">`, or stay `absolute` where the component already stacks them.
- Each icon: `transition-[opacity,scale,filter]`.
- Hidden: `opacity-0 duration-fast motion-safe:scale-25 motion-safe:blur-xs`. The outgoing icon leaves in 150ms.
- Shown: `opacity-100 duration-slow motion-safe:scale-100 motion-safe:blur-none`. The incoming icon arrives in 300ms.
- Easing: `power3-out`, the theme default (`ease-power3-out` where a class already names it). Origin: the icon's center, the default.
- An icon that mounts in place of another (Status): `transition-[opacity,scale,filter] duration-slow` with `starting:opacity-0 motion-safe:starting:scale-25 motion-safe:starting:blur-xs`.
- Reduced motion: scale and blur sit behind `motion-safe:`, so only the opacity cross-fades, 300ms in and 150ms out.

## Checklist

- [ ] **Status** (`status.tsx:46-49`). Now: `'size-4 shrink-0 transition-[opacity,scale] duration-fast'` and `mounted && 'starting:opacity-0 motion-safe:starting:scale-80'`. Make it `'size-4 shrink-0 transition-[opacity,scale,filter] duration-slow'` and `mounted && 'starting:opacity-0 motion-safe:starting:scale-25 motion-safe:starting:blur-xs'`. Keep the `mounted` gate: the icon a row loads with still does not animate.
- [ ] **Prompt composer** (`prompt-composer.tsx:95-96`). Now: `'absolute transition-[opacity,scale] duration-fast data-hidden:opacity-0 motion-safe:data-hidden:scale-80'`. Make `swapIcon` `cn('absolute transition-[opacity,scale,filter] duration-slow', 'data-hidden:opacity-0 data-hidden:duration-fast motion-safe:data-hidden:scale-25 motion-safe:data-hidden:blur-xs')`. The spinner keeps `motion-safe:animate-spin motion-reduce:animate-pulse` (`animate-spin` turns `transform`, the swap uses `scale`, so they do not fight).
- [ ] **Assistant message** (`assistant-message.tsx:48` and `:261-267`). Now the wrapper carries `*:transition-[opacity,scale,filter] *:duration-slow *:ease-power3-out`, so the outgoing icon also takes 300ms. Remove those three `*:` classes from the wrapper (keep `relative size-3 *:absolute *:inset-0`). Add `const iconSwap = 'transition-[opacity,scale,filter] duration-slow ease-power3-out';`, change `iconHidden` to `'opacity-0 duration-fast motion-safe:scale-25 motion-safe:blur-xs'`, and render `<Copy className={cn(iconSwap, copied && iconHidden)} />` and `<Check className={cn(iconSwap, !copied && iconHidden)} />`.
- [ ] **Unread dot** (`notification-inbox.tsx:505-511`). Change `transition-[opacity,scale]` to `transition-[opacity]` and `!unread && 'motion-safe:scale-50 opacity-0'` to `!unread && 'opacity-0'`. It fades over the default 150ms, `power3-out`, both ways, with or without reduced motion. Leave the bell badge's 70% pop alone: it is documented in `notification-inbox.mdx` and plays rarely.
- [ ] **Docs.** `prompt-composer.mdx:60`: replace "cross-fade into each other in 150ms with `power3-out`, the incoming icon growing from `scale-80`" with "cross-fade into each other: the incoming icon grows from `scale-25` out of a 4px blur over 300ms, and the outgoing one leaves in 150ms, both with `power3-out`". Keep the rest of the paragraph. `status.mdx:28`: say the new icon fades in and grows out of a slight blur as a status changes, and that the reduced motion setting keeps only the fade.
- [ ] **Style skill.** In `SKILL.md`, Motion, after the bullet that starts "Popovers and menus enter from", add: "An icon swap (Copy to Check, Play to Pause, Send to Stop, a new Status icon) stacks both icons in one cell and cross-fades them. The hidden icon sits at `opacity-0 motion-safe:scale-25 motion-safe:blur-xs`; the incoming one arrives in `duration-slow`, the outgoing one leaves in `duration-fast`, both `ease-power3-out` (`asset.tsx`). A small mark that toggles, such as a checkbox tick or an unread dot, only fades. Lint flags a `motion-safe:` start scale other than `scale-[0.97]`, `scale-95`, `scale-90` or `scale-25`." In `conflicts.md`, Motion table, after the "Overlay start scale" row, add this row:

  ```md
  | Icon swap scale | Emil: an entrance starts from 0.9–0.97 | `scale-25` plus `blur-xs` (4px), in 300ms, out 150ms | Two icons in one place read as one shape changing; the blur hides the overlap, and a 16px icon only travels a few pixels |
  ```
- [ ] **Lint.** In `eslint.config.mjs`, next to `motionScaleSelectors`, add a `classSelectors(...)` rule that flags a class `motion-safe:` (with any variants after it) followed by `scale-<value>` where the value is not `[0.97]`, `95`, `90`, `25`, `96` or `100`; `scale-x-*`, `scale-y-*` and `scale-(--…)` pass. Message: "Start a scale from `scale-[0.97]` (popover, menu), `scale-95` (dialog), `scale-90`, or `scale-25` with `blur-xs` (icon swap) (kosmos-style, Motion)." Add it to `codeRules` beside `...motionScaleSelectors` (`eslint.config.mjs:336`), so it reaches components, blocks, examples and the site. In `lib/code-checks.test.mts` add a flagged snippet (`'motion-safe:starting:scale-80'`) and allowed ones (`'motion-safe:data-starting-style:scale-[0.97]'`, `'motion-safe:scale-y-0'`).
- [ ] `pnpm lint` reports nothing new in the repo after the four fixes.
- [ ] Read `~/.claude/skills/review-animations/SKILL.md` (the Skill tool refuses it) and apply it to this diff by hand. A row that matches `conflicts.md` is "Kosmos style" and does not block. List its verdict in the PR.
- [ ] Feel check on the dev server: `/view/status` (change a status), `/view/prompt-composer` (send, then stop), `/view/assistant-message` (copy). In DevTools' Animations panel at 10% speed, the incoming icon grows out of a blur from a quarter size and the outgoing one is gone in half the time; spamming Copy never restarts an icon from zero. With `prefers-reduced-motion: reduce` emulated, the icons only fade. `/view/notification-inbox`: marking a notification read fades the dot without shrinking it.
- [ ] A changelog entry (`content/docs/changelog/`, copy the newest) for Status, Prompt composer, Assistant message and Notification inbox.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.

## Boundaries

- Motion classes only; no markup change except the Assistant message classes moving from the wrapper to the icons.
- Do not touch the Asset recipe, the bell, the badge, or any copy button outside Assistant message (ticket 36 does those).
- No new dependency, no new token.
