// Usage: node --test lib/registry-docs.test.mts
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const root = join(import.meta.dirname, '..');
const ui = join(root, 'registry/kosmos/ui');
const blocks = join(root, 'registry/kosmos/blocks');
const blockDocs = join(root, 'content/docs/blocks');

const components = readdirSync(ui)
  .filter((file) => file.endsWith('.registry.json'))
  .map((file) => file.replace('.registry.json', ''));

test('every component has a docs page', () => {
  const missing = components.filter((name) => !existsSync(join(root, 'content/docs/components', `${name}.mdx`)));
  assert.deepEqual(missing, [], `no content/docs/components/<name>.mdx for: ${missing.join(', ')}`);
});

test('every component has a docs demo', () => {
  const missing = components.filter((name) => !existsSync(join(root, 'registry/kosmos/examples', `${name}-demo.tsx`)));
  assert.deepEqual(missing, [], `no registry/kosmos/examples/<name>-demo.tsx for: ${missing.join(', ')}`);
});

test('every block is installed from a docs page', () => {
  const pages = readdirSync(blockDocs)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => readFileSync(join(blockDocs, file), 'utf8'))
    .join('\n');
  const missing = readdirSync(blocks).filter((name) => !pages.includes(`<ComponentInstall name="${name}"`));
  assert.deepEqual(missing, [], `no <ComponentInstall name="<block>" /> in content/docs/blocks for: ${missing.join(', ')}`);
});
