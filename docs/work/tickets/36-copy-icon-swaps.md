# 36: Copy icon swaps

**What to build:** Every copy and reveal button confirms with the same icon swap Assistant message and Asset already use: Copy turns into Check by cross-fading out of a slight blur instead of switching at once. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Motion 6 (copy and reveal buttons swap their icon at once).

**Blocked by:** 34 (it writes the icon swap recipe into the style skill and adds the start-scale lint rule this ticket follows). Runs beside 35 (no shared file).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/ui/copy-field.tsx`, `code-tabs.tsx`; `registry/kosmos/blocks/run-timeline/run-timeline.tsx`; `components/docs/code-block.tsx`, `docs-heading.tsx`, `page-actions.tsx`; one changelog entry.

Written at commit `4c91ba8`. If a quoted line no longer matches the code, stop and report instead of improvising.

## The recipe

The style skill's Motion section after ticket 34, and `registry/kosmos/ui/asset.tsx:136-139, 252-255`:

- Render both icons, stacked in one cell: `<span aria-hidden className="grid *:col-start-1 *:row-start-1">`. The Button's `[&_svg…]:size-*` still sizes them, since the selector reaches nested icons.
- Each icon: `transition-[opacity,scale,filter]`.
- Hidden: `opacity-0 duration-fast motion-safe:scale-25 motion-safe:blur-xs` (leaves in 150ms).
- Shown: `opacity-100 duration-slow motion-safe:scale-100 motion-safe:blur-none` (arrives in 300ms).
- Easing: `power3-out`, the theme default. Origin: the icon's center.
- Reduced motion: only the opacity cross-fades.

Define the two class strings once per file (for example `const iconSwap = …` and a `data-visible` or boolean switch, as `asset.tsx` does) and keep each icon's `aria-hidden`.

## Checklist

- [ ] **Copy field** (`copy-field.tsx:78` and `:82`): `{revealed ? <EyeOff aria-hidden /> : <Eye aria-hidden />}` and `{result === 'copied' ? <Check aria-hidden /> : <Copy aria-hidden />}` become stacked swaps.
- [ ] **Code tabs** (`code-tabs.tsx:104`): Check and Copy.
- [ ] **Run timeline** (`run-timeline.tsx:351`): Check and Link2 inside `HeaderAction`.
- [ ] **Docs code block** (`components/docs/code-block.tsx:172`, `CopyButton`): Check and Copy.
- [ ] **Docs heading** (`components/docs/docs-heading.tsx:60`): Check and Link.
- [ ] **Docs page actions** (`components/docs/page-actions.tsx:44`): Check and Copy before "Copy page". The stacked `span` keeps the gap the Button gives an icon; check the label does not shift.
- [ ] Accessible names do not change: the labels and the `role="status"` lines stay as they are.
- [ ] Read `~/.claude/skills/review-animations/SKILL.md` (the Skill tool refuses it) and apply it to this diff by hand. A row that matches `conflicts.md` is "Kosmos style" and does not block. List its verdict in the PR.
- [ ] Feel check on the dev server: `/view/copy-field`, `/view/code-tabs`, `/view/run-timeline`, and a docs page's code block, heading link and Copy page. In DevTools' Animations panel at 10% speed, Check grows out of a blur from a quarter size while Copy is gone in half the time; when the copy resets, the swap runs back the same way. Clicking Copy twice fast never restarts an icon from zero. With `prefers-reduced-motion: reduce` emulated, the icons only fade.
- [ ] `pnpm site-check --port <yours> --route /view/copy-field --route /view/code-tabs --route /view/run-timeline --route /docs/components/copy-field --check overflow --check console` reports nothing.
- [ ] A changelog entry (`content/docs/changelog/`, copy the newest) for Copy field, Code tabs and Run timeline. The docs site parts need none.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.

## Boundaries

- Do not touch Asset, Assistant message, Status or Prompt composer (ticket 34), or Dashboard analytics' Mark read button (a dense row action stays instant).
- No new dependency, no new token, no new registry item.
