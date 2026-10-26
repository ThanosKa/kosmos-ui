// The focus-clip sweep: finds focus rings that an ancestor with `overflow` cuts off. Used by docs-check and runnable on its
// own: `node scripts/focus-clip.mts [--port 3000] [--filter <text>] [--theme light|dark] [--width 1280]`.
// For a route it presses Tab through the page, clicks the buttons that open a popup and tabs inside it, and clicks each text
// field (pointer focus); for every focused element it compares the ring (outline plus non-inset box-shadow spread)
// with the padding box of each clipping ancestor.
import { readdirSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { chromium, type Browser, type Page } from 'playwright';
import { openSitePage, serverBase, serverOptions, type Theme } from './site.mts';

export type ClipHit = { route: string; phase: string; element: string; clipper: string; sides: string[] };

export const exampleNames = () =>
  readdirSync('registry/kosmos/examples')
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => file.replace(/\.tsx$/, ''))
    .sort();

/** Runs in the page: the clipping ancestors that cut the ring of the focused element. */
function measureFocusRing(pointer: boolean) {
  const element = document.activeElement as HTMLElement | null;
  if (!element || element === document.body) return null;
  if (!pointer && !element.matches(':focus-visible')) return null;
  if (element.tagName === 'SPAN' && !element.className) return { element: 'guard', hits: [], skip: true };
  const describe = (node: Element) => {
    const html = node as HTMLElement;
    const slot = html.dataset.slot ? `[data-slot=${html.dataset.slot}]` : '';
    const text = (html.innerText || html.getAttribute('aria-label') || '').trim().slice(0, 30);
    return `${node.tagName.toLowerCase()}${slot} "${text}"`;
  };
  const style = getComputedStyle(element);
  const box = element.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return null;
  let left = box.left;
  let top = box.top;
  let right = box.right;
  let bottom = box.bottom;
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
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      shadows.push(current);
      current = '';
    } else current += char;
  }
  shadows.push(current);
  for (const shadow of shadows) {
    if (!shadow.trim() || shadow.trim() === 'none' || /inset/.test(shadow)) continue;
    const numbers = shadow.replace(/(rgba?|oklab|oklch|color|lab|lch|hsla?)\([^)]*\)/g, '').match(/-?[\d.]+px/g)?.map(parseFloat) ?? [];
    const [x = 0, y = 0, , spread = 0] = numbers;
    if (spread <= 0) continue;
    left = Math.min(left, box.left + x - spread);
    right = Math.max(right, box.right + x + spread);
    top = Math.min(top, box.top + y - spread);
    bottom = Math.max(bottom, box.bottom + y + spread);
  }
  const grows = [box.left - left, box.top - top, right - box.right, bottom - box.bottom];
  if (grows.every((grow) => grow <= 0.5)) return { element: describe(element), hits: [] };
  const hits: { clipper: string; sides: string[] }[] = [];
  for (let ancestor = element.parentElement; ancestor && ancestor !== document.documentElement && ancestor !== document.body; ancestor = ancestor.parentElement) {
    const ancestorStyle = getComputedStyle(ancestor);
    if (ancestorStyle.overflowX === 'visible' && ancestorStyle.overflowY === 'visible') continue;
    const rect = ancestor.getBoundingClientRect();
    const paddingLeft = rect.left + ancestor.clientLeft;
    const paddingTop = rect.top + ancestor.clientTop;
    const paddingRight = paddingLeft + ancestor.clientWidth;
    const paddingBottom = paddingTop + ancestor.clientHeight;
    const over: [string, number, boolean][] = [
      ['left', paddingLeft - left, ancestorStyle.overflowX !== 'visible'],
      ['top', paddingTop - top, ancestorStyle.overflowY !== 'visible'],
      ['right', right - paddingRight, ancestorStyle.overflowX !== 'visible'],
      ['bottom', bottom - paddingBottom, ancestorStyle.overflowY !== 'visible'],
    ];
    // An element that itself reaches past the edge is scrolled content, not a ring that the edge cuts.
    const inside: Record<string, boolean> = {
      left: box.left >= paddingLeft - 0.5,
      top: box.top >= paddingTop - 0.5,
      right: box.right <= paddingRight + 0.5,
      bottom: box.bottom <= paddingBottom + 0.5,
    };
    const sides = over.filter(([side, amount, clips]) => clips && amount > 0.5 && inside[side]).map(([side, amount]) => `${side} ${amount.toFixed(1)}px`);
    if (sides.length) hits.push({ clipper: describe(ancestor), sides });
  }
  return { element: describe(element), hits };
}

const popupSelector = '[role=dialog], [role=alertdialog], [role=menu], [role=listbox], [data-slot$="-popup"]';
const triggerSelector = 'button:visible:enabled, [role=combobox]:visible, [role=button]:visible, [aria-haspopup]:visible';
const fieldSelector = 'input:visible, textarea:visible, [role=combobox]:visible, [data-slot=tabs-content]:visible';

/** Sweeps one `/view` route in a fresh page of `browser` and returns the clipped rings it found. */
export async function sweepRoute(browser: Browser, base: string, name: string, theme: Theme, width: number): Promise<ClipHit[]> {
  const route = `/view/${name}`;
  const hits: ClipHit[] = [];
  const { page, context } = await openSitePage(browser, base, `${route}?theme=${theme}`, { theme, viewport: { width, height: 800 } });
  try {
    await page.locator('[data-preview-root]').waitFor({ timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    const seen = new Set<string>();
    const measure = async (phase: string, pointer: boolean) => {
      const result = await page.evaluate(measureFocusRing, pointer).catch(() => null);
      if (!result) return false;
      if (result.skip) return null;
      const key = `${phase}|${result.element}`;
      if (seen.has(key)) return false;
      seen.add(key);
      for (const hit of result.hits) hits.push({ route, phase, element: result.element, ...hit });
      return true;
    };
    const tabThrough = async (phase: string, first: boolean) => {
      for (let step = 0; step < 70; step += 1) {
        if (step > 0 || first) await page.keyboard.press('Tab');
        const fresh = await measure(phase, false);
        if (fresh === false) break;
      }
    };
    await tabThrough('page', true);
    const reopen = async () => {
      await page.reload({ waitUntil: 'load' });
      await page.locator('[data-preview-root]').waitFor({ timeout: 15000 });
    };
    const triggers = Math.min(await page.locator(triggerSelector).count(), 60);
    for (let index = 0; index < triggers; index += 1) {
      try {
        const trigger = page.locator(triggerSelector).nth(index);
        const before = await page.locator(popupSelector).count();
        await trigger.scrollIntoViewIfNeeded({ timeout: 300 });
        await trigger.click({ timeout: 500 });
        await page.waitForTimeout(150);
        if ((await page.locator(popupSelector).count()) > before) {
          await measure(`popup#${index}`, false);
          await tabThrough(`popup#${index}`, false);
          await reopen();
        }
      } catch {
        // an element that cannot be clicked here (covered, detached) is not a clipping finding
      }
    }
    const fields = Math.min(await page.locator(fieldSelector).count(), 20);
    for (let index = 0; index < fields; index += 1) {
      try {
        const field = page.locator(fieldSelector).nth(index);
        await field.scrollIntoViewIfNeeded({ timeout: 300 });
        await field.click({ timeout: 500, position: { x: 3, y: 3 } });
        await measure(`pointer#${index}`, true);
      } catch {
        // as above
      }
    }
  } finally {
    await context.close();
  }
  return hits;
}

/** Sweeps `names` with `parallel` pages at a time and returns every hit, sorted by route. */
export async function sweepRoutes(browser: Browser, base: string, names: string[], theme: Theme, width: number, parallel = 12) {
  const hits: ClipHit[] = [];
  const queue = [...names];
  await Promise.all(
    Array.from({ length: parallel }, async () => {
      for (let name = queue.shift(); name; name = queue.shift()) {
        try {
          hits.push(...(await sweepRoute(browser, base, name, theme, width)));
        } catch (error) {
          hits.push({ route: `/view/${name}`, phase: 'error', element: 'page', clipper: (error as Error).message.split('\n')[0] ?? '', sides: [] });
        }
      }
    }),
  );
  return hits.sort((a, b) => a.route.localeCompare(b.route));
}

if (import.meta.main) {
  const { values } = parseArgs({ options: { ...serverOptions, filter: { type: 'string' }, theme: { type: 'string' }, width: { type: 'string' } } });
  const browser = await chromium.launch();
  const names = exampleNames().filter((name) => !values.filter || name.includes(values.filter));
  const started = Date.now();
  const hits = await sweepRoutes(browser, serverBase(values), names, (values.theme as Theme) ?? 'light', Number(values.width ?? 1280));
  await browser.close();
  for (const hit of hits) console.log(`${hit.route} ${hit.phase} ${hit.element} cut by ${hit.clipper}: ${hit.sides.join(', ')}`);
  console.log(`${hits.length} hits in ${names.length} routes, ${Math.round((Date.now() - started) / 1000)}s`);
  process.exit(hits.length ? 1 : 0);
}
