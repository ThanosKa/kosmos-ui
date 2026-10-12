---
name: build-component
description: The cycle every Kosmos component and block goes through, from build to screenshots, review rounds, report and group approval. Use when adding or changing a component or block in registry/kosmos.
---

# Build a component or block

One cycle for every component and block: build it, shoot it, review it, fix it (at most 3 rounds), report, and wait for the user to approve its group. Button is the worked example for each file below: copy its shape.

A block follows the same cycle; [Blocks](#blocks) lists what changes.

## 1. Load the style

Call the Skill tool with `kosmos-style` before writing a line, and keep its **Before you finish** table for step 4. It wins every conflict with a review skill. Use the terms in `GLOSSARY.md`.

## 2. Build

Write the component fresh on Base UI (`@base-ui/react`). For a component that already exists, check each file below against this table and fix what differs. Each file is found by its name; adding a component edits no shared file.

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

Use the dev server on the port you were given, starting it with `pnpm dev --port <N>` if none runs (the script rebuilds the registry first; bare `next dev` does not). Then:

```bash
pnpm screenshots <name> --port <N>
```

On a new machine, install the browsers once: `pnpm exec playwright install chromium` for `pnpm screenshots` (the script prints this when the browser is missing), and `npm install -g agent-browser` (or `brew install agent-browser`) followed by `agent-browser install` for step 4.

Read all four PNGs it prints (light and dark, 375 and 1280 wide). A page error makes it exit 1: fix that first. The shots run under reduced motion, so a state only motion shows (the press scale in the `active` column) is checked in step 4.

## 4. Review

Call the Skill tool with `better-interface` and review the review preview, its four screenshots and its source files, as a screen review. Here the review leads to fixes in step 5, as when the user asks better-interface to implement its findings. Use its findings format. Then go through the kosmos-style **Before you finish** table line by line.

Then explore what a screenshot cannot show with `agent-browser` on `/view/<name>?theme=light` and `?theme=dark` (`agent-browser --help` lists every command; give `screenshot` an absolute path). Cover one control of each kind (each variant, each size, the link form, the disabled-but-focusable case), not every cell:

- Keyboard: `press Tab` plus `screenshot` for the focus order and the focus outline; Enter and Space activate.
- Overlays: open and close with keyboard and pointer; Escape and a click outside close; focus returns to the trigger.
- Motion: `mouse down` on a control plus `get styles` for the press scale; `set media light reduced-motion` to see it turn into a cross-fade or nothing.
- Text: a long label, and the page at 320px wide.

`eval` may be blocked in an isolated worktree; `get styles`, `get box` and `snapshot` answer the same questions.

A finding that contradicts a value in kosmos-style keeps the Kosmos value and is listed under `Kosmos style` (as its conflicts.md says); it is not a fix. A finding only the user can settle, because fixing it breaks a kosmos-style rule or it is a product choice, is marked `Needs decision`.

## 5. Fix, in rounds

A **round** is steps 3 to 5: shoot, review, fix every finding you accept. Start the next round on the fixed code.

- Stop when a round's review leaves only `Kosmos style` and `Needs decision` findings.
- Stop after round 3 regardless. Every finding still standing goes to **Open** in the report, with the reason it stayed open. A fourth round needs the user.

## 6. Check the registry and the code

```bash
pnpm registry:check <name>   # valid JSON, shadcn add in a clean app, that app builds
pnpm types:check
pnpm lint
pnpm build                   # safe while the dev server runs
```

Then call the Skill tool with `mattpocock-skills:code-review`. Its fixed point is the branch you started from, so commit to your feature branch first; its spec is the ticket or request that started the work. Every command passes before the report.

## 7. Docs and changelog

The docs page from step 2 matches the final code: every prop in `TypeTable`, every example file used on the page. The docs nav lists every file in `content/docs/components/` and `content/docs/blocks/` by itself.

When a component or block is added, or changes for its users (new prop or variant, visual change, behavior change, rename, removal), add a changelog entry: `content/docs/changelog/YYYY-MM-DD-<slug>.mdx`, frontmatter `title`, `description` and `date`, the date in the file name equal to `date`. The title starts with the action ("Added Badge", "Changed Button focus outline"), so search tells it apart from the component's own page. Copy the shape of the newest entry there. A change to a component that has not been released since its "Added" entry goes into that entry. Internal refactors and changes to examples or docs text get no entry. Write the text with `better-writing`.

## 8. Report

End with this report, one per component or block:

```markdown
## <Name>: awaiting approval on /approve/<group>

Rounds: <n> of 3

Final screenshots:
- .screenshots/<name>-light-375.png
- .screenshots/<name>-light-1280.png
- .screenshots/<name>-dark-375.png
- .screenshots/<name>-dark-1280.png

Fixed:
- <finding> -> <fix> (round <n>)

Open:
- <finding>: <Kosmos style | Needs decision | out of rounds | tooling>, <why>

Needs user:
- Run `/review-animations` on <files>
- Approve the <Group> group at /approve/<group>

Checks:
- registry:check: <pass | fail: reason>
- types:check, lint, build: <pass | fail: reason>, <new warnings>
- code-review: <findings, or none>
```

The `/review-animations` line appears only when the component has motion: anything that moves, scales or animates in or out (press scale, enter and exit, height, sliding indicators, keyframes, `motion` code). That skill runs only when the user calls it, so the report asks for it.

## 9. Approval

`/approve/<group>` shows every item whose registry item names that group, each as its review preview in light and in dark. The user approves the whole group there, once.

A component or block is ready only when the user approves its group in their own words. Until then its status is **awaiting approval**, whatever the checks say. Feedback from the user starts a new round, with its own limit of 3.

## Blocks

- Files: `registry/kosmos/blocks/<name>/` holds the block's files; its item has `"type": "registry:block"` and `"meta": { "group": "blocks" }`.
- Name: what the block is, as a kebab-case noun phrase that no component uses: `app-sidebar`, `page-header`, `data-table`, `stats-overview`, then `kanban-board`, `detail-drawer`, `command-menu`, `new-item-dialog`. No numbered suffix; add `-02` only when a second variant of the same block arrives. The main export is the name in PascalCase (`DataTable`). _Decided without the user (2026-10-11), pending confirmation:_ shadcn numbers its blocks (`sidebar-07`), but descriptive names read better in an install command, in search and when the landing page composes the blocks.
- One file, `<name>/<name>.tsx`, with file type `registry:component`, so it lands in `components/<name>.tsx`. Sample data sits at the top of the file under a `// Sample data` comment, typed, and the block takes it as props with the samples as defaults. All blocks share one demo world, Parallax, a fictional product analytics SaaS with its projects, users, events, revenue and roadmap, so the landing page can compose them into one dashboard. [demo-world.md](demo-world.md) holds the whole cast (people, projects, domains, numbers) and what each block shows; take names and values from it, never invent new ones.
- Build only from Kosmos components and tokens. `registryDependencies` names every `@kosmos/*` component the block imports, so `registry:check` proves they arrive with it.
- Lay the block out by its own width: where its layout changes with width, `@container` on its root and container variants (`@md:`, `@3xl:`), never viewport breakpoints, so it fits beside a sidebar or inside a panel. A block that only scrolls (a table) needs none. Components that decide by viewport keep doing so: Sidebar's drawer, and menu popups, which render outside the block and size by the screen (`sm:min-w-56`).
- State: every value a user changes works controlled (`value` + `on…Change`) and uncontrolled (`default…`). A block's single menus (switchers, filters, user menu) take their root props through a prop (`filterMenu`, `userMenu`), so a review preview can pin one open with `{ open: true, modal: false }`; a menu repeated per row is checked in `agent-browser` instead. A pinned menu positions against the viewport, so put that frame at the top of the preview, where the screenshot's 800px viewport holds it.
- The review preview shows the block at real size in its states (empty, loading, full, long text, open overlays, a narrow container) instead of a state matrix, each in a framed box (`rounded-xl border border-transparent bg-background shadow-card`). `<name>-demo.tsx` is the docs hero and the `registry:check` smoke page: interactive, imports only the block and its dependencies.
- The docs page lives in `content/docs/blocks/<name>.mdx`: hero preview, install, usage, what it does, API (`TypeTable`).
