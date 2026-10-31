import { docsTabs } from './docs-tabs.ts';
import { docsRoute } from './shared.ts';

/** The links in the site header and its phone sheet: the docs tabs, then pages of their own. */
export const siteLinks: readonly { href: string; label: string }[] = [
  ...docsTabs,
  { href: '/presets', label: 'Presets' },
  { href: `${docsRoute}/changelog`, label: 'Changelog' },
];

export { currentLinkHref } from './current-link.ts';
