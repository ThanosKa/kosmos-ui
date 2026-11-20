# 30: Docs site fixes

**What to build:** The docs shell hydrates cleanly, follows the visitor's preset on every page, reads at the Kosmos prose measure, tells the reader when a copy fails, keeps focus order and screen reader names sensible, and scrolls its table of contents like the sidebar beside it. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Docs 2 and Blocks 24 (one cause: the preview frame writes attributes before React hydrates), Docs 4 (prose runs 88 to 95 characters a line), Docs 6 (the site not-found page ignores the preset), Docs 7 (copy buttons fail silently), Docs 8 (install tabs: focus reaches Copy before the tabs), Docs 9 (the changelog half: entry pages mark no sidebar item), Docs 10 (one name for every heading's copy button; new tabs unannounced), Docs 11 (the TOC scrolls in a native box), Docs 12 (a conditional inline `style` slips past lint).

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `components/docs/`: `preview-frame`, `code-block`, `docs-heading`, `page-actions`, `foundations/copy-swatch`, `docs-tabs`, `docs-sidebar`, `docs-toc`, `preview-shell`; `app/(view)/view/[name]/page.tsx`, `app/(site)/docs/[[...slug]]/page.tsx`, `app/global-not-found.tsx`, `components/site/search-dialog.tsx`; lint.

- [ ] Preview frame: the `data-in-frame` and `data-centered` flags go on the iframe document's `<html>` (which has `suppressHydrationWarning`), and the root is styled with ancestor variants (`in-data-in-frame:`). Reload each `/docs/blocks/*` page 16 times: no hydration error.
- [ ] Prose measure: `DocsBody` caps its prose children at the Kosmos measure, `[&>p]:max-w-[40em] [&>ul]:max-w-[40em] [&>ol]:max-w-[40em]` (style skill Typography), so code blocks, previews and tables keep the full column. Block pages use the same cap in place of `max-w-prose`.
- [ ] Not-found page: `app/global-not-found.tsx` renders `SitePresetScript` in its `<head>` and `SitePresetSync`, and exports the same `viewport` as `app/(site)/layout.tsx`. A `pnpm test` case fails when it lacks either.
- [ ] Copy: one docs copy hook with a failed state, which says "Couldn't copy. Select the text and copy it." in the existing `role="status"` span. Copy code, Copy link to section, Copy Markdown (whose fetch can fail too), the copy swatch and the search palette's "Copy install command" use it; the palette action gets its own status line. Do not change the registry's `hooks/use-copy.ts` here. A lint rule flags `navigator.clipboard` and `useCopyButton(` in `components/` outside that hook.
- [ ] Install tabs: the Copy button comes after `TabsList` in the DOM (its absolute position keeps it where it is); an outer `TabsContent` whose content holds focusable tabs takes `tabIndex={-1}`.
- [ ] Sidebar: the Changelog item is current on its entry pages (`item.url === '/docs/changelog' && pathname.startsWith('/docs/changelog/')`).
- [ ] Heading copy buttons are named after their heading (`aria-labelledby` a `sr-only` "Copy link to" span and the heading's link). "Open in Claude", "Open in ChatGPT" and "View source on GitHub" carry a `sr-only` "(opens in a new tab)", as `page-header.tsx` does.
- [ ] TOC: `ScrollArea` with `viewportRef` for `ScrollProvider` and `focusable={false}`. A lint rule flags `overflow-auto`, `overflow-x-auto` and `overflow-y-auto` in `components/docs` (style skill detection table), with the code block viewport allowlisted and its reason given, a flagged and an allowed snippet in `lib/code-checks.test.mts`, and its line in the style skill. Ticket 28 adds the same rule for blocks and `components/site`; whichever lands second joins the two into one rule.
- [ ] Preview shell: `style={{ '--stage-height': … }}` with `h-(--stage-height)`. The inline style rule (`styleSelectors` in `eslint.config.mjs`) also matches objects inside a `ConditionalExpression` or `LogicalExpression`, with a flagged and an allowed snippet in `lib/code-checks.test.mts`.
- [ ] `pnpm site-check --route /docs --check console --check overflow` reports nothing. (The docs sidebar's focus findings belong to ticket 18.)
- [ ] `pnpm lint`, `pnpm types:check` and `pnpm test` pass.
