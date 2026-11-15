import { currentLinkHref } from './current-link.ts';
import { docsRoute } from './shared.ts';

/** The header tabs. Each tab has its own sidebar: the docs pages whose address it owns. */
export const docsTabs = [
  { id: 'docs', href: docsRoute, label: 'Docs' },
  { id: 'components', href: `${docsRoute}/components`, label: 'Components' },
  { id: 'charts', href: `${docsRoute}/charts`, label: 'Charts' },
  { id: 'blocks', href: `${docsRoute}/blocks`, label: 'Blocks' },
] as const;

export type DocsTabId = (typeof docsTabs)[number]['id'];

/** The tab a path belongs to: the longest tab address that prefixes it. */
export function docsTabOf(pathname: string): DocsTabId | undefined {
  const href = currentLinkHref(docsTabs, pathname);
  return docsTabs.find((tab) => tab.href === href)?.id;
}
