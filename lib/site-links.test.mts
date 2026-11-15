// Usage: node --test lib/site-links.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { currentLinkHref, siteLinks } from './site-links.ts';

const links = [
  { href: '/docs', label: 'Docs' },
  { href: '/docs/components', label: 'Components' },
  { href: '/presets', label: 'Presets' },
];

test('a page under a link belongs to it', () => {
  assert.equal(currentLinkHref(links, '/docs/installation'), '/docs');
  assert.equal(currentLinkHref(links, '/presets'), '/presets');
});

test('the longest link that holds the page wins', () => {
  assert.equal(currentLinkHref(links, '/docs/components/button'), '/docs/components');
  assert.equal(currentLinkHref(links, '/docs/components'), '/docs/components');
});

test('a link does not hold a page that only starts with the same letters', () => {
  assert.equal(currentLinkHref(links, '/docs-old'), undefined);
  assert.equal(currentLinkHref(links, '/presetsx'), undefined);
});

test('a page outside every link has no current link', () => {
  assert.equal(currentLinkHref(links, '/'), undefined);
});

test('the site links start with the docs tabs, in their order', () => {
  assert.deepEqual(
    siteLinks.slice(0, 4).map((link) => link.label),
    ['Docs', 'Components', 'Charts', 'Blocks'],
  );
});

test('the Presets page and the changelog have links of their own after the docs tabs', () => {
  assert.deepEqual(siteLinks.slice(4), [
    { href: '/presets', label: 'Presets' },
    { href: '/docs/changelog', label: 'Changelog' },
  ]);
});

test('the changelog is its own current link, not the Docs tab', () => {
  assert.equal(currentLinkHref(siteLinks, '/docs/changelog'), '/docs/changelog');
  assert.equal(currentLinkHref(siteLinks, '/docs/installation'), '/docs');
});
