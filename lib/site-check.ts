// The browser check: what it looks for on a page, which pages it visits and which findings are known exceptions.
// scripts/site-check.mts runs it against a dev server.
import { existsSync, globSync } from 'node:fs';
import type { Browser, Page } from 'playwright';
import { openSitePage, type Theme } from '../scripts/site.mts';
import { readRegistryItems } from './registry.ts';

export const checks = ['overflow', 'focus-ring', 'clipped-text', 'names', 'console'] as const;
export type Check = (typeof checks)[number];

export type Finding = { route: string; theme: Theme; width: number; check: Check | 'load'; detail: string };

/** A deliberate exception: findings of `check` on `route` (narrowed to those whose detail has `detail`) do not fail the run. */
export type KnownException = { route: string; check: Finding['check']; detail?: string; reason: string };

export const phoneWidth = 375;
/** The widths the Presets page iframe gives its preview on a 375 and a 1280 page. */
export const previewWidths = [341, 966];
const previewTabs = ['components', 'dashboard', 'forms', 'overlays', 'tokens'] as const;
const previewRoute = /^\/preset-preview \((\w+)\)$/;
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
 * `group` keeps one route, or every route under it (`/view`, `/docs/components`); `/` is the landing page alone.
 */
export function siteRoutes(group?: string) {
  const docs = globSync('content/docs/**/*.mdx').map((file) => `/docs/${file.replace('content/docs/', '').replace(/\.mdx$/, '')}`.replace(/\/?index$/, ''));
  const previews = readRegistryItems()
    .filter((item) => (item.type === 'registry:ui' || item.type === 'registry:block') && existsSync(`registry/kosmos/examples/${item.name}.tsx`))
    .map((item) => `/view/${item.name}`);
  const presetPreviews = previewTabs.map((tab) => `/preset-preview (${tab})`);
  const routes = [...new Set(['/', '/presets', ...presetPreviews, ...docs, ...previews])].sort();
  if (!group) return routes;
  const prefix = group.endsWith('/') ? group : `${group}/`;
  return routes.filter((route) => route === group || (group !== '/' && route.startsWith(prefix)) || route.startsWith(`${group} (`));
}

/** The widths a route is visited at when none are asked for: the preview's own widths, else `defaults`. */
export function widthsFor(route: string, defaults: number[]) {
  return previewRoute.test(route) ? previewWidths : defaults;
}

type Measured = { detail: string };
type Cut = { element: string; clipper: string; sides: string[] };

/** Runs in the page: the focused element's ring box against every ancestor that clips, or null when nothing is cut. */
function measureFocusRing(rested: Map<Element, string>): Measured | null {
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
  const splitShadows = (value: string) => {
    const parts: string[] = [];
    let depth = 0;
    let current = '';
    for (const char of value) {
      if (char === '(') depth++;
      if (char === ')') depth--;
      if (char === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
      } else current += char;
    }
    parts.push(current.trim());
    return parts;
  };
  const restingShadows = splitShadows(rested.get(element) ?? 'none');
  const shadows = splitShadows(style.boxShadow).filter((shadow) => !restingShadows.includes(shadow));
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
  const fadeStrip = 32;
  const hasRing = box.left - left > subpixel || box.top - top > subpixel || right - box.right > subpixel || bottom - box.bottom > subpixel;
  if (!hasRing) return null;
  const cuts: Cut[] = [];
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
  if (cuts[0]) return { detail: `${cuts[0].element} is cut by ${cuts[0].clipper} on ${cuts[0].sides.join(', ')}` };
  for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.getAttribute('data-slot') !== 'scroll-area-viewport') continue;
    const viewportStyle = getComputedStyle(ancestor);
    const rect = ancestor.getBoundingClientRect();
    const overflowOf = (axis: string, end: string) => Math.min(fadeStrip, parseFloat(viewportStyle.getPropertyValue(`--scroll-area-overflow-${axis}-${end}`)) || 0);
    const under: string[] = [];
    const topFade = overflowOf('y', 'start');
    const bottomFade = overflowOf('y', 'end');
    const leftFade = overflowOf('x', 'start');
    const rightFade = overflowOf('x', 'end');
    if (topFade > 0 && top < rect.top + topFade && bottom > rect.top) under.push(`top ${Math.round(topFade)}px`);
    if (bottomFade > 0 && bottom > rect.bottom - bottomFade && top < rect.bottom) under.push(`bottom ${Math.round(bottomFade)}px`);
    if (leftFade > 0 && left < rect.left + leftFade && right > rect.left) under.push(`left ${Math.round(leftFade)}px`);
    if (rightFade > 0 && right > rect.right - rightFade && left < rect.right) under.push(`right ${Math.round(rightFade)}px`);
    if (under.length) return { detail: `${describe(element)} has its ring under the edge fade of ${describe(ancestor)} on ${under.join(', ')}` };
  }
  return null;
}

/** Runs in the page: visible text whose box runs past an ancestor that clips without scrolling. */
function measureClippedText(): string[] {
  const subpixel = 1;
  const found: string[] = [];
  const reported = new Set<string>();
  const describe = (node: Element) => {
    const html = node as HTMLElement;
    const classes = typeof html.className === 'string' ? html.className.split(/\s+/).filter(Boolean).slice(0, 3) : [];
    return `${node.tagName.toLowerCase()}${html.id && !/_R_|base-ui/.test(html.id) ? `#${html.id}` : ''}${html.dataset.slot ? `[data-slot=${html.dataset.slot}]` : ''}${classes.map((name) => `.${name}`).join('')}`;
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
    const owner = node.parentElement;
    if (!text || !owner || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(owner.tagName)) continue;
    const ownerStyle = getComputedStyle(owner);
    if (ownerStyle.textOverflow === 'ellipsis' || (ownerStyle.getPropertyValue('-webkit-line-clamp') || 'none') !== 'none') continue;
    if (owner.closest('.sr-only, [hidden], [aria-hidden=true], [inert]')) continue;
    let invisible = false;
    for (let up: Element | null = owner; up; up = up.parentElement) {
      const upStyle = getComputedStyle(up);
      if (upStyle.opacity === '0' || upStyle.visibility === 'hidden' || upStyle.display === 'none') invisible = true;
    }
    if (invisible) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const lineHeight = parseFloat(ownerStyle.lineHeight);
    const rects = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
    if (!rects.length) continue;
    const boxes = rects.map((rect) => {
      const height = Number.isFinite(lineHeight) && lineHeight < rect.height ? lineHeight : rect.height;
      const top = rect.top + (rect.height - height) / 2;
      return { left: rect.left, right: rect.right, top, bottom: top + height };
    });
    const box = {
      left: Math.min(...boxes.map((b) => b.left)),
      right: Math.max(...boxes.map((b) => b.right)),
      top: Math.min(...boxes.map((b) => b.top)),
      bottom: Math.max(...boxes.map((b) => b.bottom)),
    };
    let below: Element | null = null;
    for (let ancestor: Element | null = owner; ancestor && ancestor !== document.documentElement && ancestor !== document.body; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      const belowPosition = below ? getComputedStyle(below).position : 'static';
      if (belowPosition === 'fixed') break;
      const positioned = style.position !== 'static' || style.transform !== 'none';
      const skipped = belowPosition === 'absolute' && !positioned;
      below = ancestor;
      const scrollsX = ['auto', 'scroll'].includes(style.overflowX);
      const scrollsY = ['auto', 'scroll'].includes(style.overflowY);
      const clipsX = style.overflowX !== 'visible' && !scrollsX;
      const clipsY = style.overflowY !== 'visible' && !scrollsY;
      if (skipped || (!clipsX && !clipsY && !scrollsX && !scrollsY)) continue;
      if (ancestor.clientWidth <= 1 || ancestor.clientHeight <= 1) break;
      if (scrollsX || scrollsY) {
        const scroller = ancestor.getBoundingClientRect();
        const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);
        const innerX = scroller.left + ancestor.clientLeft;
        const innerY = scroller.top + ancestor.clientTop;
        if (scrollsX) {
          box.left = clamp(box.left, innerX, innerX + ancestor.clientWidth);
          box.right = clamp(box.right, innerX, innerX + ancestor.clientWidth);
        }
        if (scrollsY) {
          box.top = clamp(box.top, innerY, innerY + ancestor.clientHeight);
          box.bottom = clamp(box.bottom, innerY, innerY + ancestor.clientHeight);
        }
      }
      if (!clipsX && !clipsY) continue;
      const rect = ancestor.getBoundingClientRect();
      const innerLeft = rect.left + ancestor.clientLeft;
      const innerTop = rect.top + ancestor.clientTop;
      const sides = [
        ['left', innerLeft - box.left, clipsX],
        ['top', innerTop - box.top, clipsY],
        ['right', box.right - (innerLeft + ancestor.clientWidth), clipsX],
        ['bottom', box.bottom - (innerTop + ancestor.clientHeight), clipsY],
      ]
        .filter(([, past, clips]) => clips && (past as number) > subpixel)
        .map(([side, past]) => `${side} ${Math.round(past as number)}px`);
      if (!sides.length) continue;
      if (style.textOverflow === 'ellipsis' || (style.getPropertyValue('-webkit-line-clamp') || 'none') !== 'none') break;
      const key = `${text}|${describe(ancestor)}`;
      if (!reported.has(key)) {
        reported.add(key);
        found.push(`"${text.slice(0, 40)}" is cut by ${describe(ancestor)} (overflow ${style.overflowX}/${style.overflowY}) on ${sides.join(', ')}`);
      }
      break;
    }
  }
  return found;
}

/** Tabs through the page and reports each element whose focus ring a clipping ancestor cuts. A shadow an element wears before it takes focus is not its ring. */
async function focusRingFindings(page: Page) {
  const rested = await page.evaluateHandle(() => new Map([...document.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex],[contenteditable]')].map((element) => [element, getComputedStyle(element).boxShadow])));
  const seen = new Set<string>();
  const cuts: Measured[] = [];
  for (let stop = 0; stop < maxTabStops; stop++) {
    await page.keyboard.press('Tab');
    const cut = await page.evaluate(measureFocusRing, rested).catch(() => null);
    const identity = await page.evaluate(() => {
      const active = document.activeElement;
      return active && active !== document.body ? `${active.tagName}|${(active as HTMLElement).innerText?.slice(0, 40)}|${[...(active.parentElement?.children ?? [])].indexOf(active)}|${active.getBoundingClientRect().top}` : '';
    });
    if (!identity || seen.has(identity)) break;
    seen.add(identity);
    if (cut) cuts.push(cut);
  }
  return cuts.map((cut) => cut.detail);
}

const namedRoles = ['button', 'link', 'textbox', 'combobox', 'listbox', 'dialog', 'checkbox', 'switch', 'slider', 'tab', 'menuitem'];

/** Reads an ARIA snapshot and lists each control of a named role that has no accessible name, with the nearest named line above it. */
export function unnamedControls(snapshot: string) {
  const unnamed = new RegExp(`^(\\s*)- (${namedRoles.join('|')})((?: \\[[^\\]]+\\])*):?$`);
  const lines = snapshot.split('\n');
  const details = new Set<string>();
  lines.forEach((line, index) => {
    const match = line.match(unnamed);
    if (!match) return;
    const indent = match[1].length;
    const parent = lines.slice(0, index).reverse().find((above) => above.trim() && above.length - above.trimStart().length < indent);
    details.add(`${match[2]}${match[3]} has no accessible name${parent ? ` in ${parent.trim().replace(/^- /, '').replace(/:$/, '')}` : ''}`);
  });
  return [...details];
}

/** Opens `route` in `theme` at `width` and runs `only` (default every check). Overflow counts at phone width or narrower. */
export async function checkPage(browser: Browser, base: string, route: string, { theme, width }: { theme: Theme; width: number }, only: readonly Check[] = checks) {
  const found = (check: Finding['check'], detail: string): Finding => ({ route, theme, width, check, detail });
  const tab = route.match(previewRoute)?.[1];
  let opened: Awaited<ReturnType<typeof openSitePage>>;
  try {
    opened = await openSitePage(browser, base, tab ? '/preset-preview' : route, { theme, viewport: { width, height: 800 }, navigationTimeout: 120_000 });
  } catch (error) {
    return [found('load', String(error instanceof Error ? error.message : error).split('\n')[0])];
  }
  const { page, context, errors } = opened;
  try {
    if (route.startsWith('/view/')) await page.locator('[data-preview-root]').waitFor({ timeout: 10_000 });
    if (tab) {
      await page.locator('[data-preview-ready]').waitFor({ state: 'attached', timeout: 10_000 });
      await page.evaluate((id) => window.postMessage({ source: 'kosmos-site', type: 'page', page: id }, window.location.origin), tab);
      await page.locator(`[data-preview-page="${tab}"]`).waitFor({ state: 'attached', timeout: 10_000 });
    }
    await page.waitForLoadState('networkidle').catch(() => {});
    const findings: Finding[] = [];
    if (only.includes('overflow') && width <= phoneWidth) {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) findings.push(found('overflow', `scrolls sideways, ${overflow}px wider than the viewport`));
    }
    if (only.includes('focus-ring')) {
      for (const detail of await focusRingFindings(page)) findings.push(found('focus-ring', detail));
    }
    if (only.includes('clipped-text')) {
      for (const detail of await page.evaluate(measureClippedText)) findings.push(found('clipped-text', detail));
    }
    if (only.includes('names')) {
      for (const detail of unnamedControls(await page.locator('body').ariaSnapshot())) findings.push(found('names', detail));
    }
    if (only.includes('console')) {
      for (const message of new Set(errors)) findings.push(found('console', message.slice(0, 200)));
    }
    return findings;
  } finally {
    await context.close();
  }
}
