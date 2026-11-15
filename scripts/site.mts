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

/** A dev server message that applies a changed file to the open page: server components, or client modules. */
function isHotUpdate(message: string) {
  if (!message.startsWith('{')) return false;
  try {
    const { type, action } = JSON.parse(message) as { type?: string; action?: string };
    return ['serverComponentChanges', 'turbopack-message'].includes(type ?? action ?? '');
  } catch {
    return false;
  }
}

/**
 * Opens `path` on the server at `base`, pinned to `theme`, with reduced motion (unless `reducedMotion` says otherwise),
 * the dev indicator hidden and hot updates dropped. Throws when the page does not answer 200. Page errors and console errors land in `errors`; close `context` when done.
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
  // Each check opens a fresh page, so it drops the dev server's hot updates. Left in, a file changing in the served
  // checkout (another session's edit, pull or branch switch) reaches a page still hydrating, and Next updates its router
  // before it has mounted ("Can't perform a React state update on a component that hasn't mounted yet"); steady changes
  // keep the page refetching, so it never goes network-idle. The socket stays: Next also sends hydration data over it.
  await context.routeWebSocket(/\/_next\/(webpack-)?hmr/, (socket) => {
    const server = socket.connectToServer();
    server.onMessage((message) => {
      if (typeof message === 'string' && isHotUpdate(message)) return;
      socket.send(message);
    });
  });
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
