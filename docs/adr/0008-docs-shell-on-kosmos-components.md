# Docs shell on Kosmos components

The docs render their own shell instead of Fumadocs' docs layout. The shell has the landing page's site header, a docked Kosmos Sidebar, and the page. A sticky right rail holds the table of contents and the edit and issue links. On phones the header's menu button opens the same Sidebar as a drawer. The docs are where a visitor first sees the product. So we build the frame around every page from the components it documents. The frame follows the Kosmos style, and any change to the Sidebar shows up in the docs too.

Fumadocs stays underneath for what it does well. That is the page tree, the search index and API, and the ⌘K shortcut. It also covers the table of contents data and headless observer, code highlighting, and the MDX components. The search dialog is ours. It uses the Kosmos `CommandDialog` and `Command` parts and takes its results from the Fumadocs search client.

_Decided without the user (2026-10-12), pending confirmation._

## Considered options

- Restyle Fumadocs' docs layout with CSS. Its sidebar, collapse button and grid are its own markup, so a restyle fights `fd-*` classes on every upgrade and still never uses the Kosmos Sidebar.
- Build the shell from Kosmos components (chosen).

## Consequences

- `DocsLayout` and `DocsPage` are not used. Their table of contents slot needs the layout context, so the rail uses the headless `fumadocs-core/toc` parts.
- The landing page and the docs share `SiteHeader`; the docs pass the drawer trigger into its menu slot.
- Sidebar links navigate on the client, so the shell stays mounted and the sidebar keeps its scroll position between pages.
- Fumadocs CSS that targets its own layout (`#nd-sidebar`, the docs grid variables) no longer matches anything.
- `RootProvider` gets our `SearchDialog` through `search.SearchDialog`, so ⌘K opens the same palette the Command docs show, and a change to `CommandDialog` reaches the docs search too. Fumadocs' own search dialog and its styles are not used.
