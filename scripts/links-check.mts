// Usage: pnpm links:check [--port 3000 | --base http://localhost:3000] [--external]
// Crawls the site from a running server (best a production build: `pnpm build && pnpm start`) in a real browser,
// starting at /, every sitemap URL, robots.txt, llms.txt and llms-full.txt, and following every internal link,
// image, iframe and social image it finds. Fails on a link that does not answer 200, a #fragment with no element
// of that id, a page error, an indexable page without a title, description and social image, or a missing page
// that does not answer 404. --external also requests every outside link once. Exits 1 on any failure.
import { parseArgs } from 'node:util';
import { chromium, type BrowserContext } from 'playwright';
import { serverBase, serverOptions } from './site.mts';

const { values } = parseArgs({
  options: {
    ...serverOptions,
    external: { type: 'boolean', default: false },
  },
});

const base = new URL(serverBase(values)).origin;
const concurrency = 6;

type Visit = { status: number; type: string; ids?: Set<string> };

const failures: string[] = [];
const visits = new Map<string, Promise<Visit>>();
/** Every link found, as `target -> pages linking to it`, kept for the failure messages and the fragment check. */
const linkedFrom = new Map<string, Set<string>>();
const external = new Map<string, Set<string>>();

/** The origin absolute URLs on the site are written with: NEXT_PUBLIC_SITE_URL at build time, read off the sitemap. */
let siteOrigin = base;

function record(map: Map<string, Set<string>>, target: string, from: string) {
  if (!map.has(target)) map.set(target, new Set());
  map.get(target)!.add(from);
}

/** `href` as a path on this site (with its #fragment), or null for an outside or non-page link. */
function internalPath(href: string, from: string) {
  let url: URL;
  try {
    url = new URL(href, new URL(from, base));
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.origin !== base && url.origin !== siteOrigin) {
    record(external, url.href, from);
    return null;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

const withoutHash = (path: string) => path.split('#')[0];
const sourcesOf = (path: string) => [...(linkedFrom.get(path) ?? [])].slice(0, 3).join(', ') || 'start';

/** Markdown links and bare URLs in a text response (llms.txt, the .md pages). */
function textLinks(text: string) {
  return [...text.matchAll(/\]\(([^)\s]+)\)|(https?:\/\/[^\s)>\]"'`]+)/g)]
    .map((match) => (match[1] ?? match[2]).replace(/[.,;:]+$/, ''))
    // A URL template such as `https://…/r/{name}.json` in the install docs is not a link.
    .filter((href) => !href.includes('{'));
}

/**
 * Outside URLs anywhere in a page's HTML, including the props of links that only render once a menu opens (the
 * "Open in GitHub" item). SVG namespaces are not links.
 */
function outsideUrlsIn(html: string, from: string) {
  // A URL ends at the first character HTML escapes, except `&amp;` inside its query.
  for (const [href] of html.matchAll(/https?:\/\/(?:[^\s"'`<>)\\&]|&amp;)+/g)) {
    if (!href.includes('{') && !href.startsWith('http://www.w3.org/')) internalPath(href.replaceAll('&amp;', '&'), from);
  }
}

async function visitHtml(context: BrowserContext, path: string): Promise<Visit> {
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    const response = await page.goto(new URL(path, base).href, { waitUntil: 'load' });
    const status = response?.status() ?? 0;
    const previewRoute = path.startsWith('/view/') || path === '/dashboard';
    // An example cancels its link clicks only once React has hydrated it, so wait for React's props on every example
    // link (an internal key, the one sign of hydration a page can read), then a frame for the effects to run.
    await page
      .waitForFunction(
        (whole) =>
          [...document.querySelectorAll(whole ? 'a[href]' : '[data-preview-content] a[href]')].every((link) =>
            Object.keys(link).some((key) => key.startsWith('__reactProps$')),
          ),
        previewRoute,
        { timeout: 10000 },
      )
      .catch(() => failures.push(`examples on ${path} never hydrated`));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50))));
    const found = await page.evaluate((previewRoute) => {
      /**
       * Whether clicking `link` would leave the page. Examples hold links to pages of the sample app and keep the
       * visitor in place by cancelling the click, so a cancelled link in an example is not followed. Only examples
       * are probed: a client-routed site link cancels its click too.
       */
      const leaves = (link: Element) => {
        const preview = previewRoute ? document.body : link.closest('[data-preview-content]');
        if (!preview?.contains(link)) return true;
        let cancelled = false;
        const record = (event: Event) => {
          cancelled = event.defaultPrevented;
          event.preventDefault();
        };
        window.addEventListener('click', record);
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        window.removeEventListener('click', record);
        return !cancelled;
      };
      const attr = (selector: string, name: string) =>
        [...document.querySelectorAll(selector)]
          .filter((element) => element.tagName !== 'A' || leaves(element))
          .map((element) => element.getAttribute(name))
          .filter((value): value is string => !!value);
      const meta = (key: string) =>
        document.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.getAttribute('content')?.trim() ?? '';
      return {
        ids: [...document.querySelectorAll('[id]')].map((element) => element.id),
        // Fumadocs and Base UI set ids on headings and panels; a link may also target a named anchor.
        names: attr('a[name]', 'name'),
        links: [...attr('a[href]', 'href'), ...attr('iframe[src]', 'src'), ...attr('img[src]', 'src'), ...attr('link[rel="alternate"]', 'href')],
        images: [meta('og:image'), meta('twitter:image')].filter(Boolean),
        title: document.title.trim(),
        description: meta('description'),
        noindex: /noindex/.test(meta('robots')),
      };
    }, previewRoute);
    if (status === 200) {
      if (!found.title) failures.push(`no title: ${path}`);
      if (!found.noindex) {
        if (!found.description) failures.push(`no description: ${path}`);
        if (found.images.length === 0) failures.push(`no social image: ${path}`);
      }
      for (const href of [...found.links, ...found.images]) {
        const target = internalPath(href, path);
        if (target !== null) {
          record(linkedFrom, target, path);
          void visit(context, withoutHash(target));
        }
      }
    }
    if (errors.length) failures.push(`page error on ${path}: ${errors.join(' | ')}`);
    return { status, type: 'text/html', ids: new Set([...found.ids, ...found.names]) };
  } finally {
    await page.close();
  }
}

let active = 0;
const waiting: (() => void)[] = [];
async function slot<T>(work: () => Promise<T>) {
  if (active >= concurrency) await new Promise<void>((resolve) => waiting.push(resolve));
  active += 1;
  try {
    return await work();
  } finally {
    active -= 1;
    waiting.shift()?.();
  }
}

/** Requests `path` once; an HTML page is then opened in the browser and its links followed. */
function visit(context: BrowserContext, path: string): Promise<Visit> {
  if (!visits.has(path)) {
    visits.set(
      path,
      slot(async () => {
        const response = await fetch(new URL(path, base), { headers: { Accept: 'text/html,*/*' } });
        const type = response.headers.get('content-type') ?? '';
        if (!response.ok) return { status: response.status, type };
        if (type.includes('text/html')) {
          outsideUrlsIn(await response.text(), path);
          return visitHtml(context, path);
        }
        if (/^text\/|xml|markdown/.test(type)) {
          for (const href of textLinks(await response.text())) {
            const target = internalPath(href, path);
            if (target !== null) {
              record(linkedFrom, target, path);
              void visit(context, withoutHash(target));
            }
          }
        } else await response.arrayBuffer();
        return { status: response.status, type };
      }),
    );
  }
  return visits.get(path)!;
}

/** Waits until no visit is pending: each finished page may have queued more. */
async function settle() {
  let size = -1;
  while (size !== visits.size) {
    size = visits.size;
    await Promise.all(visits.values());
  }
}

/** Statuses a site answers a robot with when it limits or blocks it: the link may be fine, so it is only reported. */
const throttled = new Set([429, 503, 999]);
const unverified: string[] = [];

async function requestOutside(href: string) {
  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(href, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Mozilla/5.0 kosmos-links-check' } });
    await response.arrayBuffer();
    if (!throttled.has(response.status) || attempt === 3) return response.status;
    await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
  }
}

async function checkExternal() {
  await Promise.all(
    // `.example` is reserved and never resolves: the sample app's own addresses use it.
    [...external.keys()].filter((href) => !new URL(href).hostname.endsWith('.example')).map((href) =>
      slot(async () => {
        const from = [...external.get(href)!].slice(0, 3).join(', ');
        try {
          const status = await requestOutside(href);
          if (throttled.has(status)) unverified.push(`${status} ${href} (linked from ${from})`);
          else if (status >= 400) failures.push(`${status} ${href} (linked from ${from})`);
        } catch (error) {
          failures.push(`unreachable ${href}: ${(error as Error).message} (linked from ${from})`);
        }
      }),
    ),
  );
}

const sitemapResponse = await fetch(new URL('/sitemap.xml', base)).catch(() => null);
if (!sitemapResponse?.ok) {
  console.error(`${base}/sitemap.xml did not answer 200 (is the server running on ${base}?)`);
  process.exit(1);
}
const sitemapUrls = [...(await sitemapResponse.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
if (sitemapUrls.length === 0) failures.push('the sitemap lists no URLs');
siteOrigin = sitemapUrls[0]?.origin ?? base;

const robots = await (await fetch(new URL('/robots.txt', base))).text();
if (!robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`)) failures.push(`robots.txt does not point at ${siteOrigin}/sitemap.xml`);

const browser = await chromium.launch().catch((error: Error) => {
  console.error(`could not launch Chromium (run \`pnpm exec playwright install chromium\`): ${error.message}`);
  process.exit(1);
});
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });

for (const path of ['/', '/llms.txt', '/llms-full.txt', ...sitemapUrls.map((url) => url.pathname)]) void visit(context, path);
await settle();

for (const path of ['/this-page-does-not-exist', '/docs/this-page-does-not-exist']) {
  const status = (await visit(context, path)).status;
  if (status !== 404) failures.push(`missing page ${path} answered ${status}, not 404`);
}

for (const [path, visitPromise] of visits) {
  const { status } = await visitPromise;
  if (status !== 200 && !path.includes('this-page-does-not-exist')) failures.push(`${status} ${path} (linked from ${sourcesOf(path)})`);
}

for (const target of linkedFrom.keys()) {
  const [path, fragment] = target.split('#');
  if (!fragment) continue;
  const { ids } = await visits.get(path)!;
  if (ids && !ids.has(decodeURIComponent(fragment))) failures.push(`no #${fragment} on ${path} (linked from ${sourcesOf(target)})`);
}

if (values.external) await checkExternal();
await browser.close();

const pages = [...visits.values()].length;
console.log(`${pages} URLs crawled from ${base}${values.external ? `, ${external.size} outside links requested` : `, ${external.size} outside links not requested (--external)`}`);
for (const link of unverified) console.log(`warn not verified, the site limits robots: ${link}`);
for (const failure of failures) console.log(`FAIL ${failure}`);
if (failures.length) process.exit(1);
console.log('ok   no broken links');
