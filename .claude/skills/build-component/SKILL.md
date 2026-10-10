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

Write the component fresh on Base UI (`@base-ui/react`). Each file below is found by its name; adding a component edits no shared file.

| File | What it holds |
| --- | --- |
| `registry/kosmos/ui/<name>.tsx` | The component. |
| `registry/kosmos/ui/<name>.registry.json` | The registry item: `dependencies`, `registryDependencies` (`@kosmos/tokens`, `@kosmos/cn`, any other `@kosmos/*` it imports) and `"meta": { "group": "<group>" }`. The groups and their keys are `groups` in `lib/registry.ts`; the ticket names the group. |
| `registry/kosmos/examples/<name>.tsx` | The **review preview**: every variant in every state through `StateMatrix` and `previewState()` (`components/preview/`), plus sizes, compositions and a long-text case. Pin open states too (an open menu, a checked box), so one screenshot shows them. |
| `registry/kosmos/examples/<name>-demo.tsx` | The docs hero example. `registry:check` also renders it in the clean project. |
| `registry/kosmos/examples/<name>-<example>.tsx` | One file per docs example. |
| `content/docs/components/<name>.mdx` | The docs page: hero preview, install, usage, examples, API (`TypeTable`). |

Each of these renders at `/view/<file name>`. The conventions behind them live in the header comments of `lib/registry.ts`, `lib/examples.ts` and `scripts/*.mts`.

Done when `/view/<name>` renders every row of the matrix with no console error.

## 3. Shoot

Run the dev server on the port you were given (`pnpm dev --port <N>`), then:

```bash
pnpm screenshots <name> --port <N>
```

Read all four PNGs it prints (light and dark, 375 and 1280 wide). A page error makes it exit 1: fix that first.

## 4. Review

Call the Skill tool with `better-interface` and review the four screenshots and the source against it and the better-* skills it pulls in. Then go through the kosmos-style **Before you finish** table line by line.

Then explore what a screenshot cannot show with `agent-browser` on `/view/<name>` (`agent-browser skills get core` teaches it; give `screenshot` an absolute path): Tab through every control, check the focus order and the visible focus outline, open and close every overlay with keyboard and pointer (Escape, click outside, focus returning to the trigger), and set reduced motion. Write each finding as one line: what, where, which rule.

A finding that contradicts a value in kosmos-style keeps the Kosmos value and is marked `Kosmos style`; it is not a fix.

## 5. Fix, in rounds

A **round** is steps 3 to 5: shoot, review, fix every finding you accept. Start the next round on the fixed code.

- Stop when a round's review leaves no finding except `Kosmos style` ones.
- Stop after round 3 regardless. Every finding still standing goes to **Open** in the report, with the reason it stayed open. A fourth round needs the user.

## 6. Check the registry and the code

```bash
pnpm registry:check <name>   # valid JSON, shadcn add in a clean app, that app builds
pnpm types:check
pnpm lint
pnpm build
```

Then call the Skill tool with `mattpocock-skills:code-review` on the change, against `AGENTS.md` and the ticket. Every command passes before the report.

## 7. Docs and changelog

The docs page from step 2 matches the final code: every prop in `TypeTable`, every example file used on the page.

When a component or block is added, or changes for its users (new prop or variant, visual change, behavior change, rename, removal), add a changelog entry: one MDX file per dated entry in `content/docs/changelog/`, with the file name and frontmatter of the newest entry there. Internal refactors with no visible change get none. Write the text with `better-writing`.

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
- <finding>: <why it stayed open: Kosmos style | out of rounds | needs a decision>

Needs user:
- Run `/review-animations` on <files>   <- only when it has motion
- Approve the <Group> group at /approve/<group>

Checks: registry:check, types:check, lint, build, code-review
```

Motion means anything that moves, scales or animates in or out: press scale, enter and exit, height, sliding indicators, keyframes, `motion` code. `review-animations` runs only when the user calls it, so the report asks for it; it never replaces the user's call.

## 9. Approval

`/approve/<group>` shows every item whose registry item names that group, each as its review preview in light and in dark. The user approves the whole group there, once.

A component or block is ready only when the user approves its group in their own words. Until then its status is **awaiting approval**, whatever the checks say. Feedback from the user starts a new round, with its own limit of 3.

## Blocks

- Files: `registry/kosmos/blocks/<name>/` holds the block's files; its item has `"type": "registry:block"` and `"meta": { "group": "blocks" }`.
- Build only from Kosmos components and tokens. `registryDependencies` names every `@kosmos/*` component the block imports, so `registry:check` proves they arrive with it.
- The review preview shows the block at real size in its states (empty, loading, full, long text, open overlays) instead of a state matrix.
- The docs page lives in `content/docs/blocks/<name>.mdx`.
