# 17: Third-party notice check

**What to build:** Every registry item built from MIT code says so in its registry item, and `pnpm test` fails when such an item does not ship its source's notice (ADR 0010). Today nothing marks a ported item, so a missing notice cannot be detected; ticket 12 left this check out for that reason. Spec: `docs/work/audit-spec.md`.

**Decision (the marker):** `meta.sources` on the item's `<name>.registry.json`, an array of notice ids: `"meta": { "group": "effects", "sources": ["magic-ui"] }`. The id `magic-ui` names the file `LICENSE-MAGIC-UI` beside the item (`registry/kosmos/ui/` for a component, the block's own folder for a block), listed in `files` as `{ "type": "registry:file", "target": "~/LICENSE-MAGIC-UI" }`, the shape the seven items with a notice already use.

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Status:** ready-for-agent

**Touches:** `registry/kosmos/**/<name>.registry.json` (the `meta` line only), `registry.json` if `pnpm registry:build` rewrites it, new `LICENSE-*` files, one new test in `lib/`, `.claude/skills/kosmos-style/building.md`.

- [ ] The items that ship a notice today carry `meta.sources`: Blur fade, Number ticker, Flickering grid, Text reveal and the Bento block (`magic-ui`), Glow (`launch-ui`), Sonner (`sonner`).
- [ ] Find the other items built from MIT code (shadcn/ui's Base UI variant first): merged PR bodies (`gh pr list --state merged --limit 300 --json number,title,body`), the changelog and docs pages that credit a source. Each gets the marker and its notice with the source's copyright line (shadcn/ui: `LICENSE-SHADCN`, "Copyright (c) 2023 shadcn"). Items written fresh under ADR 0004 get no marker. The PR lists every item checked, its verdict and the evidence; an item with no evidence either way is listed as unknown and gets no marker.
- [ ] A test in `pnpm test` fails when: an item's `meta.sources` names an id whose `LICENSE-<ID>` the item does not list in `files`, or whose file is missing, holds no `Copyright` line, or does not install to `~/LICENSE-<ID>`; an item ships a `LICENSE-*` file its `meta.sources` does not name; a `LICENSE-*` file under `registry/` ships with no item. The test shows one flagged and one passing case on small fixture items, then runs over the real registry.
- [ ] `pnpm registry:check` passes with the new `meta` field (see how `lib/registry.ts` reads `meta`).
- [ ] `building.md` (its first paragraph names the third-party notice) says to mark the item with `meta.sources` and that `pnpm test` checks it.
- [ ] A changelog entry if an item gains a notice a user now installs.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
