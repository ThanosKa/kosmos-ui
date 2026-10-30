# Building a component or block

Build on Base UI (`@base-ui/react`), from scratch or from MIT-licensed code restyled to the Kosmos style, with the source's copyright line in a third-party notice (ADR 0010). Each file is found by its name, so adding one edits no shared file. Copy Button's files for the shape:

| File | What it holds |
| --- | --- |
| `registry/kosmos/ui/<name>.tsx` | The component. A block lives in `registry/kosmos/blocks/<name>/` |
| `registry/kosmos/ui/<name>.registry.json` | `dependencies`, `registryDependencies` (`@kosmos/tokens`, `@kosmos/cn`, every `@kosmos/*` it imports) and `"meta": { "group": "<group>" }`, a key of `groups` in `lib/registry.ts` |
| `registry/kosmos/examples/<name>.tsx` | The review preview at `/view/<name>`: every variant in every state through `StateMatrix` and `previewState()`, a long-text case, and an empty case when it shows data. Overlays render open in an `OverlayStage` and add a `<name>-thumb.tsx`, pinned open, for the index |
| `registry/kosmos/examples/<name>-demo.tsx` | The docs hero example; one more `<name>-<example>.tsx` per docs example |
| `content/docs/components/<name>.mdx` | The docs page: preview, install, usage, examples, and every prop in `TypeTable`. A block is installed from a page in `content/docs/blocks/` with `<ComponentInstall name="<name>" />` |
| `content/docs/changelog/YYYY-MM-DD-<slug>.mdx` | When an item is added or changes for its users. Copy the newest entry; the title starts with the action ("Added Badge", "Changed Button focus outline"). A change to an item not released since its "Added" entry goes into that entry |

Sample data in every preview, demo and docs page comes from one fictional company, Acme, in [demo-world.md](demo-world.md). A value it lacks is added there in the same change.

`pnpm test` fails when a component has no docs page or demo, or a block no install line. The rest of the done check is SKILL.md, Before you finish.

## Changing Button

- The Button also takes shadcn's names as aliases, so shadcn components (Dialog, Alert Dialog, Pagination) keep working in an app that swaps shadcn's Button for ours. Variant `default` renders `primary`, `outline` renders `secondary`, and `link` is an ink text link that underlines on hover and does not press-scale; size `default` renders `md`, `xs` renders `sm` and `icon-xs` renders `icon-sm`. `data-variant` and `data-size` carry the Kosmos name. `pnpm registry:smoke` proves the swap builds.
- ESLint enforces the Button rules in this repo (`no-restricted-syntax` in `eslint.config.mjs`, which also lints the tsx code blocks of the docs pages): no raw `<button>`, an explicit `variant`, and Kosmos names only. The prop itself stays optional with a `primary` default, so an app that swaps in our Button with `shadcn add -o` still builds.
