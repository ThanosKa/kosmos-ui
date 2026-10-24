// What the scripts that check the site from a running server share: the --port and --base options, and opening a
// page in a real browser.
import type { Browser } from 'playwright';

/** The options that point a script at a running server, for `parseArgs`. */
export const serverOptions = {
  port: { type: 'string' },
  base: { type: 'string' },
} as const;

/** The server's address: `--base`, else localhost on `--port`, the `PORT` env var or 3000. */
export function serverBase(values: { port?: string; base?: string }) {
  return values.base ?? `http://localhost:${values.port ?? process.env.PORT ?? 3000}`;
}

export type Theme = 'light' | 'dark';
export type ReducedMotion = 'reduce' | 'no-preference';

type OpenOptions = {
  theme?: Theme;
  viewport: { width: number; height: number };
  deviceScaleFactor?: number;
  reducedMotion?: ReducedMotion;
};

/**
 * Opens `path` on the server at `base`, pinned to `theme`, with reduced motion (unless `reducedMotion` says otherwise)
 * and the dev indicator hidden. Throws when the page does not answer 200. Page errors and console errors land in `errors`; close `context` when done.
 */
export async function openSitePage(
  browser: Browser,
  base: string,
  path: string,
  { theme = 'light', viewport, deviceScaleFactor = 1, reducedMotion = 'reduce' }: OpenOptions,
) {
  const context = await browser.newContext({ viewport, deviceScaleFactor, colorScheme: theme, reducedMotion });
  // next-themes reads localStorage first; pinning it makes pages without ?theme deterministic too. The dev server's
  // indicator would sit in every page and every iframe, so it is hidden in each frame.
  await context.addInitScript((value) => {
    localStorage.setItem('theme', value);
    document.addEventListener('DOMContentLoaded', () => {
      document.head.append(Object.assign(document.createElement('style'), { textContent: 'nextjs-portal { display: none !important; }' }));
    });
  }, theme);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const url = new URL(path, base).href;
  const response = await page.goto(url, { waitUntil: 'load' });
  if (!response?.ok()) throw new Error(`${url} returned ${response?.status()} (is the dev server running on ${base}?)`);
  return { page, context, errors };
}
