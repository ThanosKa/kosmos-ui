// Usage: node --test lib/copy.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { copyText } from '../registry/kosmos/hooks/use-copy.ts';

test('the text is copied when the clipboard takes it', async () => {
  const written: string[] = [];
  const clipboard = { writeText: async (text: string) => void written.push(text) };
  assert.equal(await copyText('acme_sk_7Q2K', clipboard), 'copied');
  assert.deepEqual(written, ['acme_sk_7Q2K']);
});

test('the copy fails when the browser refuses', async () => {
  const clipboard = { writeText: () => Promise.reject(new DOMException('Write permission denied.', 'NotAllowedError')) };
  assert.equal(await copyText('acme_sk_7Q2K', clipboard), 'failed');
});

test('the copy fails on a page with no clipboard, such as one served over plain http', async () => {
  assert.equal(await copyText('acme_sk_7Q2K', null), 'failed');
});
