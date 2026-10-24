import { docsRoute } from './shared.ts';

/** The header tabs. Each tab has its own sidebar: the docs pages whose address it owns. */
export const docsTabs = [
  { id: 'docs', href: docsRoute, label: 'Docs' },
  { id: 'components', href: `${docsRoute}/components`, label: 'Components' },
  { id: 'blocks', href: `${docsRoute}/blocks`, label: 'Blocks' },
] as const;

export type DocsTabId = (typeof docsTabs)[number]['id'];

/** The tab a path belongs to: the longest tab address that prefixes it. */
export function docsTabOf(pathname: string): DocsTabId | undefined {
  return [...docsTabs]
    .sort((a, b) => b.href.length - a.href.length)
    .find((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`))?.id;
}
