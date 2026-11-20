// Usage: node --test lib/toast.test.mts
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { build } from 'esbuild';
import { chromium, type Browser } from 'playwright';

const entry = `
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster, createToastManager } from '@/registry/kosmos/ui/toast';

const manager = createToastManager();
window.addToast = (options) => manager.add(options);
window.addRichToast = () => manager.add({ description: <span>Invoice <b>INV-0042</b> sent</span> });

createRoot(document.getElementById('root')).render(<Toaster toastManager={manager} />);
`;

let browser: Browser;
let bundle: string;

before(async () => {
  const result = await build({
    stdin: { contents: entry, loader: 'tsx', resolveDir: process.cwd() },
    bundle: true,
    write: false,
    format: 'iife',
    jsx: 'automatic',
    logLevel: 'error',
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  bundle = result.outputFiles[0].text;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
});

async function toastName(add: string) {
  const page = await browser.newPage();
  await page.setContent('<div id="root"></div>');
  await page.addScriptTag({ content: bundle });
  await page.evaluate(add);
  const toast = page.locator('[data-slot="toast"]');
  await toast.waitFor();
  const name = await toast.getAttribute('aria-label');
  await page.close();
  return name;
}

test('a toast with no title is named by its text description', async () => {
  assert.equal(await toastName(`addToast({ description: 'Invoice INV-0042 sent' })`), 'Invoice INV-0042 sent');
});

test('a toast with no title and a rich description gets a readable name', async () => {
  assert.equal(await toastName('addRichToast()'), 'Notification');
});
