---
name: build-component
description: The cycle every Kosmos component and block goes through, from build to screenshots, review rounds, report and approval. Use when adding or changing a component or block in registry/kosmos.
---

# Build a component or block

One cycle for every component and block: build it, shoot it, review it, fix it (at most 3 rounds), report, and wait for the user to approve it. Button is the worked example for each file below: copy its shape.

A block follows the same cycle; [Blocks](#blocks) lists what changes.

## 1. Load the style

Call the Skill tool with `kosmos-style` before writing a line, and keep its **Before you finish** table for step 4. It wins every conflict with a review skill. Use the terms in `GLOSSARY.md`.

## 2. Build

Build the component on Base UI (`@base-ui/react`), from scratch or from MIT-licensed code restyled to the Kosmos style, with the source's copyright line in a third-party notice (ADR 0010). For a component that already exists, check each file below against this table and fix what differs. Each file is found by its name; adding a component edits no shared file.

| File | What it holds |
| --- | --- |
| `registry/kosmos/ui/<name>.tsx` | The component. |
| `registry/kosmos/ui/<name>.registry.json` | The registry item: `dependencies`, `registryDependencies` (`@kosmos/tokens`, `@kosmos/cn`, any other `@kosmos/*` it imports) and `"meta": { "group": "<group>" }`. The groups and their keys are `groups` in `lib/registry.ts`; the ticket names the group. |
| `registry/kosmos/examples/<name>.tsx` | The **review preview**: every variant in every state through `StateMatrix` and `previewState()` (`components/preview/`), plus sizes, compositions and a long-text case. Pin open states too (an open menu, a checked box), so one screenshot shows them. Overlays (dialog, drawer, popover, menu) render open inside an `OverlayStage` (`components/preview/overlay-stage.tsx`) instead of a matrix cell, with controlled `open`, `modal={false}`, `initialFocus={false}` and the stage as `container`. |
| `registry/kosmos/examples/<name>-demo.tsx` | The docs hero example. `registry:check` also renders it in the clean project. |
| `registry/kosmos/examples/<name>-<example>.tsx` | One file per docs example. |
| `registry/kosmos/examples/<name>-thumb.tsx` | Overlays only: the index thumbnail, the overlay pinned open in a `ThumbStage` (`components/preview/overlay-stage.tsx`), because the demo renders it closed. Shoot it with `pnpm thumbnails <name> --port <N>`. |
| `content/docs/components/<name>.mdx` | The docs page: hero preview, install, usage, examples, API (`TypeTable`). |

Every file in `registry/kosmos/examples/` renders at `/view/<file name>`. The conventions behind these files live in the header comments of `lib/registry.ts`, `lib/examples.ts` and `scripts/*.mts`.

Done when `/view/<name>` renders every row of the matrix with no console error.

## 3. Shoot

Run `pnpm lint` before you shoot: it catches the token and class rules for free, and a screenshot is the costly check. Shoot only when the change shows at rest: a new component or block, or a change to color, type, spacing, size, layout or a state's look. A change only to motion, keyboard, focus, ARIA, docs or sample data skips this step; check it in step 4 with `agent-browser` and write `Final screenshots: none, <reason>` in the report.

Use the dev server on the port you were given, starting it with `pnpm dev --port <N>` if none runs (the script rebuilds the registry first; bare `next dev` does not). Then:

```bash
pnpm screenshots <name> --port <N>
```

On a new machine, install the browsers once: `pnpm exec playwright install chromium` for `pnpm screenshots` (the script prints this when the browser is missing), and `npm install -g agent-browser` (or `brew install agent-browser`) followed by `agent-browser install` for step 4.

Read all four PNGs it prints (light and dark, 375 and 1280 wide). A page error makes it exit 1: fix that first. The shots run under reduced motion, so a state only motion shows (the press scale in the `active` column) is checked in step 4.

## 4. Review

Call the Skill tool with `emil-design-eng` and review the review preview, its screenshots when step 3 took them, and its source files, as a screen review. The review leads to fixes in step 5. Write findings in the format at the end of the kosmos-style [conflicts.md](../kosmos-style/conflicts.md). Then go through the kosmos-style **Before you finish** table line by line.

Then explore what a screenshot cannot show with `agent-browser` on `/view/<name>?theme=light` and `?theme=dark` (`agent-browser --help` lists every command; give `screenshot` an absolute path). Cover one control of each kind (each variant, each size, the link form, the disabled-but-focusable case), not every cell:

- Keyboard: `press Tab` plus `screenshot` for the focus order and the focus outline; Enter and Space activate.
- Overlays: open and close with keyboard and pointer; Escape and a click outside close; focus returns to the trigger.
- Motion: `mouse down` on a control plus `get styles` for the press scale; `set media light reduced-motion` to see it turn into a cross-fade or nothing.
- Text: a long label, and the page at 320px wide.

`eval` may be blocked in an isolated worktree; `get styles`, `get box` and `snapshot` answer the same questions.

When the component has motion (anything that moves, scales or animates in or out: press scale, enter and exit, height, sliding indicators, keyframes, `motion` code), call the Skill tool with `review-animations` on its source files and its review preview. Its findings join the round with the others.

Call the Skill tool with `break-ui` on the review preview: feed it worst-case data that `demo-world.md` allows (long text, left-to-right non-Latin scripts such as Greek and Japanese, missing fields, zero and huge counts) and look for anything that clips, overflows or moves under the pointer when the content changes. Then call `mobile-native` and check the 375px view against it (tap highlight, sticky hover, inputs that zoom, `100vh`, safe areas). Both join the round with the others. `improve-animations` is for a codebase-wide motion audit and is not part of this cycle.

A finding that contradicts a value in kosmos-style keeps the Kosmos value and is listed under `Kosmos style` (as its conflicts.md says); it is not a fix. A finding only the user can settle, because fixing it breaks a kosmos-style rule or it is a product choice, is marked `Needs decision`.

## 5. Fix, in rounds

A **round** is steps 3 to 5: shoot when step 3 applies, review, fix every finding you accept. Start the next round on the fixed code.

- Stop when a round's review leaves only `Kosmos style` and `Needs decision` findings.
- Stop after round 3 regardless. Every finding still standing goes to **Open** in the report, with the reason it stayed open. A fourth round needs the user.

## 6. Check the registry and the code

```bash
pnpm registry:check <name>   # valid JSON, shadcn add in a clean app, that app builds
pnpm types:check
pnpm lint
pnpm test
pnpm build                   # safe while the dev server runs; CI runs lint, types:check, test and build on the PR
```

Then call the Skill tool with `mattpocock-skills:code-review`. Its fixed point is the branch you started from, so commit to your feature branch first; its spec is the ticket or request that started the work. Every command passes before the report.

## 7. Docs and changelog

The docs page from step 2 matches the final code: every prop in `TypeTable`, every example file used on the page. The docs nav lists every file in `content/docs/components/` and `content/docs/blocks/` by itself.

When a component or block is added, or changes for its users (new prop or variant, visual change, behavior change, rename, removal), add a changelog entry: `content/docs/changelog/YYYY-MM-DD-<slug>.mdx`, frontmatter `title`, `description` and `date`, the date in the file name equal to `date`. The title starts with the action ("Added Badge", "Changed Button focus outline"), so search tells it apart from the component's own page. Copy the shape of the newest entry there. A change to a component that has not been released since its "Added" entry goes into that entry. Internal refactors and changes to examples or docs text get no entry.

## 8. Report

End with this report, one per component or block:

```markdown
## <Name>: awaiting approval on <docs page>

Rounds: <n> of 3

Final screenshots (or `none, <reason>`):
- .screenshots/<name>-light-375.png
- .screenshots/<name>-light-1280.png
- .screenshots/<name>-dark-375.png
- .screenshots/<name>-dark-1280.png

Fixed:
- <finding> -> <fix> (round <n>)

Open:
- <finding>: <Kosmos style | Needs decision | out of rounds | tooling>, <why>

Needs user:
- Look at <Name> on <docs page> (`/docs/components/<name>`, or `/docs/blocks/<category>` for a block) in light and dark

Checks:
- registry:check: <pass | fail: reason>
- types:check, lint, test, build: <pass | fail: reason>, <new warnings>
- review-animations: <findings, none, or no motion>
- break-ui, mobile-native: <findings, or none>
- code-review: <findings, or none>
```

## 9. Approval

The user approves by looking at the item's docs page, in light and in dark with the theme toggle. For a whole group they say so once.

A component or block is ready only when the user approves it in their own words. Until then its status is **awaiting approval**, whatever the checks say. Feedback from the user starts a new round, with its own limit of 3.
