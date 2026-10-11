## Summary

<!-- The smallest view that makes the change clear: a component tree, file tree, call tree, diff sketch or Mermaid diagram, each beside one or two lines of text. -->

## Evidence

<!-- Before and after. Screenshots from the review loop for any visual change (375 and 1280, light and dark), otherwise command output. -->

- **Before:**
  **After:**

## Merge Danger

**Door:** <!-- one-way or two-way -->

**Blast Radius:** <!-- one word, then what could break: layout, consumers who ran `shadcn add`, mobile, docs -->

## Checklist

- [ ] Review loop done: screenshots reviewed and issues fixed or listed above
- [ ] Registry builds and `shadcn add` works in a clean project (`pnpm registry:smoke`)
- [ ] Docs updated (component page, changelog entry for public changes)
- [ ] `pnpm types:check` and `pnpm lint` pass
