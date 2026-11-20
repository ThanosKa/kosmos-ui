// Usage: node --test lib/not-found-page.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

const notFound = readFileSync('app/global-not-found.tsx', 'utf8');
const siteLayout = readFileSync('app/(site)/layout.tsx', 'utf8');

test('the site not-found page follows the visitor preset before it paints', () => {
  assert.match(notFound, /<head>\s*<SitePresetScript \/>\s*<\/head>/);
  assert.match(notFound, /<SitePresetSync \/>/);
});

test('the site not-found page exports the viewport of the site layout', () => {
  const viewportOf = (source: string) => source.match(/export const viewport: Viewport = (\{[\s\S]*?\n\});/)?.[1];
  assert.ok(viewportOf(siteLayout));
  assert.equal(viewportOf(notFound), viewportOf(siteLayout));
});
