// The browser check: what it looks for on a page, which pages it visits and which findings are known exceptions.
// scripts/site-check.mts runs it against a dev server.
import { existsSync, globSync } from 'node:fs';
import type { Browser, Page } from 'playwright';
import { openSitePage, type Theme } from '../scripts/site.mts';
import { readRegistryItems } from './registry.ts';

export const checks = ['overflow', 'focus-ring', 'console'] as const;
export type Check = (typeof checks)[number];

export type Finding = { route: string; theme: Theme; width: number; check: Check | 'load'; detail: string };

/** A deliberate exception: findings of `check` on `route` (narrowed to those whose detail has `detail`) do not fail the run. */
export type KnownException = { route: string; check: Finding['check']; detail?: string; reason: string };

export const phoneWidth = 375;
const maxTabStops = 60;

export function formatFinding({ route, theme, width, check, detail }: Finding) {
  return `${route}  ${theme}  ${width}  ${check}  ${detail}`;
}

export function splitKnown(findings: Finding[], exceptions: KnownException[]) {
  const isKnown = (finding: Finding) =>
    exceptions.some(({ route, check, detail }) => route === finding.route && check === finding.check && (!detail || finding.detail.includes(detail)));
  return { known: findings.filter(isKnown), failing: findings.filter((finding) => !isKnown(finding)) };
}

/**
 * Every page the check visits: the site pages, every docs page and the review preview of every component and block.
 * `group` keeps one route, or every route under it (`/view`, `/docs/components`).
 */
export function siteRoutes(group?: string) {
  const docs = globSync('content/docs/**/*.mdx').map((file) => `/docs/${file.replace('content/docs/', '').replace(/\.mdx$/, '')}`.replace(/\/?index$/, ''));
  const previews = readRegistryItems()
    .filter((item) => (item.type === 'registry:ui' || item.type === 'registry:block') && existsSync(`registry/kosmos/examples/${item.name}.tsx`))
    .map((item) => `/view/${item.name}`);
  const routes = [...new Set(['/', '/presets', ...docs, ...previews])].sort();
  if (!group) return routes;
  return routes.filter((route) => route === group || route.startsWith(`${group.replace(/\/$/, '')}/`));
}

type Measured = { element: string; clipper: string; sides: string[] };

/** Runs in the page: the focused element's ring box against every ancestor that clips, or null when nothing is cut. */
function measureFocusRing(): Measured | null {
  const subpixel = 0.5;
  const element = document.activeElement as HTMLElement | null;
  if (!element || element === document.body || !element.matches(':focus-visible')) return null;
  const style = getComputedStyle(element);
  const box = element.getBoundingClientRect();
  let { left, top, right, bottom } = box;
  const outlineWidth = parseFloat(style.outlineWidth) || 0;
  if (style.outlineStyle !== 'none' && outlineWidth > 0 && style.outlineColor !== 'rgba(0, 0, 0, 0)') {
    const reach = (parseFloat(style.outlineOffset) || 0) + outlineWidth;
    left = Math.min(left, box.left - reach);
    top = Math.min(top, box.top - reach);
    right = Math.max(right, box.right + reach);
    bottom = Math.max(bottom, box.bottom + reach);
  }
  const shadows: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of style.boxShadow) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      shadows.push(current);
      current = '';
    } else current += char;
  }
  shadows.push(current);
  for (const shadow of shadows) {
    if (!shadow.trim() || shadow.trim() === 'none' || /inset/.test(shadow)) continue;
    const lengths = shadow.replace(/(rgba?|oklab|oklch|color|lab|lch|hsla?)\([^)]*\)/g, '').match(/-?[\d.]+px/g)?.map(parseFloat) ?? [];
    const [x = 0, y = 0, , spread = 0] = lengths;
    if (spread <= 0) continue;
    left = Math.min(left, box.left + x - spread);
    right = Math.max(right, box.right + x + spread);
    top = Math.min(top, box.top + y - spread);
    bottom = Math.max(bottom, box.bottom + y + spread);
  }
  const describe = (node: Element) => {
    const html = node as HTMLElement;
    const label = html.getAttribute('aria-label') ?? (html.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30);
    const classes = typeof html.className === 'string' ? html.className.split(/\s+/).filter(Boolean).slice(0, 3) : [];
    const selector = `${node.tagName.toLowerCase()}${html.id && !/_R_|base-ui/.test(html.id) ? `#${html.id}` : ''}${html.dataset.slot ? `[data-slot=${html.dataset.slot}]` : ''}${classes.map((name) => `.${name}`).join('')}`;
    return label ? `${selector} "${label}"` : selector;
  };
  const hasRing = box.left - left > subpixel || box.top - top > subpixel || right - box.right > subpixel || bottom - box.bottom > subpixel;
  if (!hasRing) return null;
  const cuts: Measured[] = [];
  for (let ancestor = element.parentElement; ancestor && ancestor !== document.documentElement && ancestor !== document.body; ancestor = ancestor.parentElement) {
    const ancestorStyle = getComputedStyle(ancestor);
    const clipsX = ancestorStyle.overflowX !== 'visible';
    const clipsY = ancestorStyle.overflowY !== 'visible';
    if (!clipsX && !clipsY) continue;
    const rect = ancestor.getBoundingClientRect();
    const innerLeft = rect.left + ancestor.clientLeft;
    const innerTop = rect.top + ancestor.clientTop;
    const innerRight = innerLeft + ancestor.clientWidth;
    const innerBottom = innerTop + ancestor.clientHeight;
    const sides = [
      ['left', innerLeft - left, clipsX],
      ['top', innerTop - top, clipsY],
      ['right', right - innerRight, clipsX],
      ['bottom', bottom - innerBottom, clipsY],
    ]
      .filter(([, past, clips]) => clips && (past as number) > subpixel)
      .map(([side, past]) => `${side} ${Math.round(past as number)}px`);
    if (sides.length) cuts.push({ element: describe(element), clipper: `${describe(ancestor)} (overflow ${ancestorStyle.overflowX}/${ancestorStyle.overflowY})`, sides });
  }
  return cuts[0] ?? null;
}

/** Tabs through the page and reports each element whose focus ring a clipping ancestor cuts. */
async function focusRingFindings(page: Page) {
  const seen = new Set<string>();
  const cuts: Measured[] = [];
  for (let stop = 0; stop < maxTabStops; stop++) {
    await page.keyboard.press('Tab');
    const cut = await page.evaluate(measureFocusRing).catch(() => null);
    const identity = await page.evaluate(() => {
      const active = document.activeElement;
      return active && active !== document.body ? `${active.tagName}|${(active as HTMLElement).innerText?.slice(0, 40)}|${[...(active.parentElement?.children ?? [])].indexOf(active)}|${active.getBoundingClientRect().top}` : '';
    });
    if (!identity || seen.has(identity)) break;
    seen.add(identity);
    if (cut) cuts.push(cut);
  }
  return cuts.map((cut) => `${cut.element} is cut by ${cut.clipper} on ${cut.sides.join(', ')}`);
}

/** Opens `route` in `theme` at `width` and runs `only` (default every check). Overflow counts at phone width only. */
export async function checkPage(browser: Browser, base: string, route: string, { theme, width }: { theme: Theme; width: number }, only: readonly Check[] = checks) {
  const found = (check: Finding['check'], detail: string): Finding => ({ route, theme, width, check, detail });
  let opened: Awaited<ReturnType<typeof openSitePage>>;
  try {
    opened = await openSitePage(browser, base, route, { theme, viewport: { width, height: 800 } });
  } catch (error) {
    return [found('load', String(error instanceof Error ? error.message : error))];
  }
  const { page, context, errors } = opened;
  try {
    if (route.startsWith('/view/')) await page.locator('[data-preview-root]').waitFor({ timeout: 10_000 });
    await page.waitForLoadState('networkidle').catch(() => {});
    const findings: Finding[] = [];
    if (only.includes('overflow') && width === phoneWidth) {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) findings.push(found('overflow', `scrolls sideways, ${overflow}px wider than the viewport`));
    }
    if (only.includes('focus-ring')) {
      for (const detail of await focusRingFindings(page)) findings.push(found('focus-ring', detail));
    }
    if (only.includes('console')) {
      for (const message of new Set(errors)) findings.push(found('console', message.slice(0, 200)));
    }
    return findings;
  } finally {
    await context.close();
  }
}
