// Usage: pnpm screenshots <name> [more names] [--port 3000 | --base http://localhost:3000] [--out .screenshots]
//        pnpm screenshots <label> --path /docs/components/button   (any page; <label> names the files)
// Shoots /view/<name>?theme=<theme> from a running dev server at 375 and 1280 wide, light and dark:
// 4 PNGs per name, <out>/<name>-<theme>-<width>.png. Prints each path; exits 1 on any page error.
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

const { positionals: names, values } = parseArgs({
  allowPositionals: true,
  options: {
    port: { type: 'string' },
    base: { type: 'string' },
    out: { type: 'string', default: '.screenshots' },
    path: { type: 'string' },
  },
});

if (names.length === 0) {
  console.error('usage: pnpm screenshots <name> [more names] [--port N | --base URL] [--out DIR]');
  process.exit(1);
}

const base = values.base ?? `http://localhost:${values.port ?? process.env.PORT ?? 3000}`;
const outDir = resolve(values.out!);
const widths = [375, 1280] as const;
const themes = ['light', 'dark'] as const;
// Hide the Next.js dev indicator and overlay for the shot.
const shotStyle = 'nextjs-portal { display: none !important; }';

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch().catch((error: Error) => {
  if (/Executable doesn't exist|playwright install/i.test(error.message)) {
    console.error("Playwright's Chromium is not installed. Install it once with:\n\n  pnpm exec playwright install chromium\n");
    process.exit(1);
  }
  throw error;
});
let failed = false;
try {
  for (const name of names) {
    for (const theme of themes) {
      for (const width of widths) {
        const context = await browser.newContext({
          viewport: { width, height: 800 },
          deviceScaleFactor: 2,
          colorScheme: theme,
          reducedMotion: 'reduce',
        });
        // next-themes reads localStorage first; pinning it makes pages without ?theme deterministic too.
        await context.addInitScript((value) => localStorage.setItem('theme', value), theme);
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (message.type() === 'error') errors.push(message.text());
        });
        const url = new URL(values.path ?? `/view/${name}?theme=${theme}`, base).href;
        const response = await page.goto(url, { waitUntil: 'load' });
        if (!response?.ok()) {
          throw new Error(`${url} returned ${response?.status()} (is the dev server running on ${base}?)`);
        }
        if (!values.path) await page.locator('[data-preview-root]').waitFor();
        // Images that load after hydration (Avatar loads its image in JS) must be in the shot.
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts.ready);
        const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        if (isDark !== (theme === 'dark')) throw new Error(`${url}: expected ${theme}, <html> has dark=${isDark}`);
        const file = `${outDir}/${name}-${theme}-${width}.png`;
        await page.screenshot({ path: file, fullPage: true, animations: 'disabled', caret: 'hide', style: shotStyle });
        if (errors.length) failed = true;
        console.log(file + (errors.length ? `  page errors: ${errors.join(' | ')}` : ''));
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
if (failed) process.exit(1);
