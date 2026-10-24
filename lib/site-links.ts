import { docsTabs } from './docs-tabs.ts';

export type SiteLink = { href: string; label: string };

/** The links in the site header and its phone sheet: the docs tabs, then pages of their own. */
export const siteLinks: readonly SiteLink[] = [...docsTabs];

/** The link a page belongs to: the longest link address that is the page or holds it. */
export function currentLinkHref(links: readonly SiteLink[], pathname: string): string | undefined {
  return links
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}
