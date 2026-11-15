# TanStack Table for data tables

The Data table component builds on TanStack Table 9 rather than hand-written sorting, filtering and paging. shadcn's data table guide is written on TanStack Table, so a developer who installs Kosmos expects its column definitions and `getValue` / `row.original` style, and its examples carry over. Before this, the only data table was a block that sorted, filtered, counted facets and paged by hand. It took about a thousand lines tied to its `Project` type, and the dashboards' tables could reuse none of it.

_Decided with the user (2026-10-30)._

## Considered options

- **Extract the block's hand-written logic into generic parts.** Rejected: we would own sorting, faceting, selection and paging code that TanStack keeps up to date, and developers would learn a Kosmos-only API.
- **TanStack Table 8**, the version shadcn's guide shows. Rejected: 9 is the current release, ships agent skills with the package, and lets the features object type `meta`, so the parts need no global type declaration. Its column definitions read the same.

## Consequences

- `@kosmos/data-table` declares `@tanstack/react-table@^9.3.1`. Its `useDataTable` registers one fixed set of features (sorting, column and global filters, faceting, pages, row selection, column visibility) and passes every other option through, so the parts can rely on those APIs.
- The parts own markup, style and accessibility; TanStack owns state and row models. Parts read state with `table.atoms.<slice>.get()`, which is safe because the owner of `useDataTable` re-renders on every state change and the parts are not memoized.
- The block that used to be called Data table is now the Projects table block, built from the parts, since a registry name holds one item. The `facets` helper it used is gone; TanStack's faceted row model counts the values.
