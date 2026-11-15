/** The link a page belongs to: the longest link address that is the page or holds it. */
export function currentLinkHref(links: readonly { href: string }[], pathname: string): string | undefined {
  return links
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}
