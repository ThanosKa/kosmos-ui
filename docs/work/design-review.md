# System design review

Vocabulary from the codebase-design skill: module, interface, depth, seam, leverage, locality. Findings are ranked by value. Only finding 0 was changed in code; the rest wait for the maintainer.

## Done

**0. `useControlled` was copied in three blocks.** `page-header`, `stats-overview` and `data-table` each held the same hook (one without `useCallback`, so its setter changed on every render). It is now `registry/kosmos/hooks/use-controlled.ts` with its own item, `@kosmos/use-controlled`, a registry dependency of the three blocks, as `use-copy` is. `pnpm registry:check` passes for all three. Cost: small, done.

## Findings

**1. `registry-check.mts` and `registry-smoke.mts` copy their harness.** Files: `scripts/registry-check.mts`, `scripts/registry-smoke.mts`. `serveRegistry`, `run`, `cleanEnv`, `step` and the template setup exist twice and have already drifted (the smoke version reports a busy port, the check version does not). A fix to one misses the other. Change: one `scripts/lib/registry-harness.mts` (serve `public/r`, run a command in an app dir, make a clean env) that both import; each script keeps only its own checks. Cost: medium.

**2. `lib/registry.ts` is a shallow grab bag of 375 lines.** It holds item reading and validation, group and block-section vocab, the Pro variant table, block categories, tree resolution, example ownership, CSS-vars rendering, install paths and install commands. Callers import from it for unrelated reasons, so any edit has a wide blast radius. Change: split along the real seams into `registry/read.ts` (read, validate, tree), `registry/blocks.ts` (sections, tiers, categories, Pro variants) and `registry/install.ts` (installed paths, import rewrite, runners, commands), with `lib/registry.ts` kept as a re-export for the first pass. Cost: medium.

**3. `getRegistryItem` rereads and revalidates the whole registry per call.** `lib/registry.ts` `getRegistryItem` calls `readRegistryItems`, which globs, parses and reads every file to check it exists. Docs pages call it per item and per example. It is fine at 96 items in a build, but each call costs the full set. Change: memoise `readRegistryItems` per `root` for the process (keyed by root, cleared by the scripts that write files), or take `items` as an argument as `resolveRegistryTree` already does. Cost: small.

**5. Preset palettes are five full copies of every token.** Files: `lib/presets/{default,warm,soft,console,night}.ts`. Each states every light and dark token, and most values repeat across presets (`destructive`, `success`, `warning`, `scrim`, `scrollbar-thumb`, chart steps, sidebar derivations). A change to a shared status colour has to be made five times, and nothing says which values a preset chose and which it inherited. Change: define each preset as overrides over the Default (`{ ...defaultPreset.light, background, card, ... }`), and keep `presetPalette` as the one place that completes it; the existing `presets.test.mts` already guards the result. Cost: medium. It touches colour values, so check every preset's CSS output is byte-identical before and after.

**6. The site preset has two writers of one style element.** `lib/site-preset.ts` holds the head script (`sitePresetScript`) and the shared-link script (`sharedPresetScript`) as string templates that repeat the key and the style id, and the page "checks it against the choice once it hydrates" in a third place. The invariant (stored css equals `sitePresetCss(choice)`) is split over three modules. Change: keep the strings but build both from one `writeStyle(css)` snippet, and move the hydration check next to them as `isStoredPresetCurrent(value, choice)`, which is unit-testable. Cost: small.

**7. `registry/kosmos/lib` mixes two kinds of file.** `breadcrumb-fit.ts`, `stat-delta.ts` and `tags.ts` are never their own items: they ship as extra files inside `breadcrumb`, `stat-card` and `tags-input`, while `facets`, `paging`, `dates` and the rest are items. `members` imports `isEmail` from `tags.ts`, which `members.registry.json` has to get through `tags-input`. A reader cannot tell from the folder which rule applies. Change: state the rule in `kosmos-style` (a lib file used by one item ships inside it; used by two or more becomes an item) and make `tags` an item, since `members` and `tags-input` both use it. Cost: small.

**8. `lib/cn.ts` and `lib/brand.ts` are thin pass-throughs.** `lib/cn.ts` only re-exports the registry `cn`; 3 callers use `@/lib/cn` and 25 use the registry path. By the deletion test it earns nothing. `lib/brand.ts` is deep (it hides colour parsing behind `readBrandColors` and `findBrand`) and should stay. Change: point the 3 callers at the registry path and delete `lib/cn.ts`. Cost: small.

**9. The `(view)` and docs pipeline has no seam for "what a preview is".** `components/docs/{component-preview,block-viewer,preview-frame,preview-shell,block-viewer-panels}.tsx`, `app/(view)/view/[name]`, `lib/examples.ts` and `lib/registry.ts` (`exampleOwner`, `exampleExtras`) each know part of the rule that maps an example name to its owner item, its extra files and its preview URL. Changing how an example resolves means reading four modules. Change: one `lib/previews.ts` with `previewFor(name)` returning `{ owner, files, extras, url }`, used by the docs components and the view route; `registry.ts` keeps only the tree. Cost: medium to large; do it after finding 2.

**10. `lib/source.ts` carries the placeholder list inline.** The `mdxAsPlaceholder` array of 20 component names must match the MDX components the docs register and `lib/llms.ts`; a new docs component that is missing here silently leaks JSX into `llms.txt`. Change: derive the list from one exported map of docs components. Cost: small.

**11. `registry/kosmos/hooks` has only `use-copy`, `use-drift` and now `use-controlled`; `use-drift` has no item.** `use-drift.ts` is imported by `testimonials` and `logo-marquee` and ships through `drift.registry.json`, while `use-copy` and `use-controlled` have their own. Same split as finding 7. Change: apply the same rule from finding 7 (two users, so an item), or document why it rides with `drift`. Cost: small.

## Left alone on purpose

- `lib/presets/` as a whole is a good module: `presets`, `choiceFromParams`, `presetCss` and `presetRegistryItem` are a small interface over a lot of behaviour, tested at that interface. Only the data inside it (finding 5) is heavy.
- `lib/brand.ts` and `lib/tokens.ts` / `lib/contrast.ts`: deep, single-purpose, tested.
- `registry-build.mts` (78 lines) is correctly thin.

## Suggested order

Findings 3, 8, 6, 7, 11 and 10 are each under an hour and independent. Then 1 and 2, then 5. Findings 4 and 9 are the large ones and pay off most when more checks and more preview kinds arrive.
