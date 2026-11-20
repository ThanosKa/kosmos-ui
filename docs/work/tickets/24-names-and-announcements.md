# 24: Names and announcements

**What to build:** Screen reader users hear a name for every popup and field, and hear what changed: new notifications, a run's status, a copied link, an added note, a form error. A live region exists before its text arrives, which is when screen readers announce it. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Components 7 (the new-items pill's live region mounts with its text), Components 8 (Command list, Select list and untitled Popovers have no name), Blocks 4 (Settings API key field has no name), Blocks 15 (Run timeline: status changes, step times and copy results do not reach screen readers or the keyboard), Blocks 23 (live regions that mount with their text or start as `display: none`), Blocks 12 (the Run timeline part: Retry is a no-op without `onRetry`, Copy link reports success that did not happen).

**Blocked by:** 16 (its `names` check proves the fix).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/ui/notification-inbox.tsx`, `command.tsx`, `select.tsx`; `registry/kosmos/examples/popover-hover.tsx`, `popover-side.tsx`, `model-select-search.tsx`, `popover.tsx`; `content/docs/components/popover.mdx`; `registry/kosmos/blocks/`: `settings`, `run-timeline`, `dashboard-analytics`, `dashboard-crm`, `detail-drawer`, `auth-forms`; lint.

- [ ] Notification inbox: one always-rendered `sr-only` `role="status"` span holds "`${count}` new notifications" (empty at 0); the pill Button renders outside it. Follow `copy-field.tsx`, `reasoning.tsx` and `chart-card.tsx`.
- [ ] `CommandList` takes an `aria-label`, default "Commands". `SelectContent`'s list is named by its trigger (`aria-labelledby`) when no `SelectLabel` or Field label names it. The listed Popover examples with no `PopoverTitle` pass `aria-label` on `PopoverContent`, and `popover.mdx` says so beside `openOnHover`.
- [ ] Settings: the API key `CopyField` is named "API key" (`aria-label`, or a `Field` with a `FieldLabel`).
- [ ] Run timeline: one always-rendered `sr-only` `role="status"` in the header, set from the status badge's label when it changes; "Working…" lives in it, not in a status that mounts with its text. The step time's tooltip trigger is focusable, or the clock time is in `sr-only` text inside the `<time>`. Retry renders only when `onRetry` is passed. Copy link renders only when `url` is passed, copies with `useCopy` (`hooks/use-copy.ts`), and says the result in the status line.
- [ ] Dashboards: static empty states drop `role="status"`.
- [ ] Settings alert: `empty:sr-only` in place of `empty:hidden`, as `new-item-dialog.tsx` does.
- [ ] Detail drawer: Add note announces "Note added" in an always-rendered status line; an empty note shows an inline field error.
- [ ] Auth forms: `FormAlert` is the destructive `Alert`, in a container that is always rendered.
- [ ] Two lint rules, each with a flagged and an allowed snippet in `lib/code-checks.test.mts` and named in the style skill: `role="status"` or `role="alert"` on an element rendered behind a condition, or carrying `empty:hidden`; a `TooltipTrigger` whose `render` is not a button or a link.
- [ ] `pnpm site-check --check names` reports nothing on `/view/command`, `/view/select`, `/view/popover`, `/view/settings` and the docs examples `command-inline`, `command-loading`, `command-pages`.
- [ ] A changelog entry for each changed component and block.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
