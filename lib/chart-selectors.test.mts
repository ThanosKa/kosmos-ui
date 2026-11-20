// Usage: node --test lib/chart-selectors.test.mts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, test } from 'node:test';
import { build } from 'esbuild';
import { chromium, type Browser, type Page } from 'playwright';

const entry = `
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import * as Recharts from 'recharts';

const data = [
  { name: 'a', value: 1, other: 2 },
  { name: 'b', value: 3, other: 1 },
];

createRoot(document.getElementById('root')).render(
  <div style={{ width: 400, height: 240 }}>
    <Recharts.ResponsiveContainer>
      <Recharts.ComposedChart data={data}>
        <Recharts.CartesianGrid />
        <Recharts.XAxis dataKey="name" />
        <Recharts.YAxis />
        <Recharts.Area dataKey="value" />
        <Recharts.Bar dataKey="other" />
        <Recharts.Line dataKey="other" />
        <Recharts.ReferenceLine y={2} />
      </Recharts.ComposedChart>
    </Recharts.ResponsiveContainer>
  </div>,
);
`;

/** The tooltip cursor draws only while a pointer is on the chart, so a resting chart cannot show it. */
const drawnOnHover = '.recharts-tooltip-cursor';

const chartSource = readFileSync(new URL('../registry/kosmos/ui/chart.tsx', import.meta.url), 'utf8');
const selectors = [...new Set([...chartSource.matchAll(/\[&_([^\]]*\.recharts-[^\]]*)\]/g)].map((match) => match[1].replaceAll('_', ' ')))];

let browser: Browser;
let page: Page;

before(async () => {
  const bundle = await build({
    stdin: { contents: entry, loader: 'tsx', resolveDir: process.cwd() },
    bundle: true,
    write: false,
    format: 'iife',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.setContent('<div id="root"></div>');
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.waitForSelector('.recharts-surface');
});

after(async () => {
  await browser.close();
});

test('chart.tsx names the Recharts selectors it targets', () => {
  assert.ok(selectors.length > 0, 'chart.tsx targets Recharts selectors');
});

test('every Recharts selector in chart.tsx matches something in a rendered chart', async () => {
  const unmatched: string[] = [];
  for (const selector of selectors) {
    if (selector.includes(drawnOnHover)) continue;
    const count = await page.locator(`#root ${selector}`).count();
    if (count === 0) unmatched.push(selector);
  }
  assert.deepEqual(unmatched, [], `selectors in chart.tsx that match nothing in Recharts' markup: ${unmatched.join(' | ')}`);
});

test('the tooltip cursor class is still in Recharts', () => {
  const source = readFileSync(new URL('../node_modules/recharts/lib/component/Cursor.js', import.meta.url), 'utf8');
  assert.ok(source.includes(drawnOnHover.slice(1)), `${drawnOnHover} is in Recharts' Cursor`);
});
