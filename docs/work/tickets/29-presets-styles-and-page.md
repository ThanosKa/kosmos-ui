# 29: Preset styles and the Presets page

**What to build:** Iris and Night keep the Kosmos values their styles should not touch (the focus ring's 2px offset, row hover and selected fills, the current page's accent), the landing's main actions are Buttons that presets treat as Buttons, and the Presets page fits a phone, has one Tab stop for its preview and says what a preset ships. Spec: `docs/work/audit-spec.md`.

**Findings:** `docs/work/audit.md` Landing 1 (Iris: the focus ring sits flush on checked and filled controls), Landing 2 (the preview's Components tab scrolls sideways at 341), Landing 3 (Iris: table rows in a card lose their hover and selected fills), Landing 6 (landing CTAs are links styled with `buttonVariants`), Landing 10 (Night: the current sidebar item drops the accent its description promises), Landing 12 (the Presets copy says a preset is a palette and a radius), Landing 15 (the preview panel and its iframe are two Tab stops).

**Blocked by:** 15 (the site check visits `/preset-preview`).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `lib/presets/iris-style.ts`, `lib/presets/night-style.ts`, the preset style test; `components/site/preset-components.tsx`, `presets-view.tsx`, `preset-code-dialog.tsx`, `landing-pricing.tsx`; `app/(site)/(home)/page.tsx`, `app/(site)/(home)/presets/page.tsx`; lint.

- [ ] Iris: delete the `outline-offset: 0` rule (`iris-style.ts`, about lines 72-73), so Iris keeps the 2px offset. The preset style test in `pnpm test` (the one that forbids `shadow-control` and friends) also forbids `outline-offset` in a style's rules.
- [ ] Iris: delete the table row hover and selected rules (`iris-style.ts`, about lines 181-184), so Iris keeps the Kosmos row states. The preset style test fails when a style sets a table row's hover or selected fill to `card` or a mix of it.
- [ ] Night: drop the `color` line on the active sidebar item (`night-style.ts`, about lines 47-50), so the current item keeps the accent text, as its description and its navbar say.
- [ ] Presets preview: `grid-cols-1` on the Components grid below `md` (`preset-components.tsx`, about line 130). If the Growth chart still pushes under Console, give its wrapper in `components/preset-cards/data-cards.tsx` `min-w-0`; touch `registry/kosmos/ui/chart.tsx` only if the cause is there, and say so in the PR.
- [ ] Landing CTAs (`page.tsx` and `landing-pricing.tsx`) render through the Button: `<Button variant="primary" size="lg" nativeButton={false} render={<Link href=… />}>`, which keeps client navigation. A lint rule flags `className={buttonVariants(` on an element that is not `Button`, with a flagged and an allowed snippet in `lib/code-checks.test.mts`, named in the style skill.
- [ ] Copy: the Presets page lead and metadata read "Ready palettes, radii and styles for the Kosmos tokens…"; the Get code dialog's description reads "The preset you picked, its palette, radius, size and style, in light and dark."; its CSS hint reads "Paste it after the Kosmos tokens in your global CSS."
- [ ] Presets page: `tabIndex={-1}` on the `TabsContent` around the iframe (`presets-view.tsx`, about line 82).
- [ ] `pnpm site-check --route /preset-preview --route /presets --route /` reports no overflow and no `focus-ring` finding. Measured under Iris and Night: the ring keeps its offset on a checked switch, row hover and selected fills differ from the card, Night's current sidebar item is the accent.
- [ ] A changelog entry for the Iris and Night presets.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
