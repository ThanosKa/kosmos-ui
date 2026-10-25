import { docsTabs } from './docs-tabs.ts';

/** The links in the site header and its phone sheet: the docs tabs, then pages of their own. */
export const siteLinks: readonly { href: string; label: string }[] = [...docsTabs, { href: '/presets', label: 'Presets' }];

export { currentLinkHref } from './current-link.ts';
