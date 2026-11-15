// Usage: pnpm screenshots <name> [more names] [--port 3000 | --base http://localhost:3000] [--out .screenshots]
//        pnpm screenshots <label> --path /docs/components/button   (any page; <label> names the files)
//        pnpm thumbnails [name …] [--port 3000]   (= pnpm screenshots --thumbnails)
// Shoots /view/<name>?theme=<theme> from a running dev server at 375 and 1280 wide, light and dark:
// 4 PNGs per name, <out>/<name>-<theme>-<width>.png. Prints each path; exits 1 on any page error.
// --thumbnails shoots the hero preview of every component and block docs page (or only the names given)
// into public/thumbs/<name>-<theme>.png, the images on the components and blocks indexes. An overlay, whose
// hero is a closed trigger, shoots registry/kosmos/examples/<name>-thumb.tsx instead, with the overlay pinned open.
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium, type Browser, type Page } from 'playwright';
import { componentDocsFolder, readRegistryItems } from '../lib/registry.ts';
import { openSitePage, serverBase, serverOptions, type Theme } from './site.mts';

const { positionals: names, values } = parseArgs({
  allowPositionals: true,
  options: {
    ...serverOptions,
    out: { type: 'string' },
    path: { type: 'string' },
    thumbnails: { type: 'boolean', default: false },
  },
});

if (names.length === 0 && !values.thumbnails) {
  console.error('usage: pnpm screenshots <name> [more names] [--port N | --base URL] [--out DIR]');
  process.exit(1);
}

const base = serverBase(values);
const outDir = resolve(values.out ?? (values.thumbnails ? 'public/thumbs' : '.screenshots'));
const widths = [375, 1280] as const;
const reviewHeight = 800;
const themes = ['light', 'dark'] as const;

/** Opens `path` pinned to `theme` and waits until it is ready to shoot. Page errors land in `errors`. */
async function openPage(browser: Browser, path: string, theme: Theme, viewport: { width: number; height: number }, deviceScaleFactor: number) {
  const { page, context, errors } = await openSitePage(browser, base, path, { theme, viewport, deviceScaleFactor });
  if (path.startsWith('/view/')) await page.locator('[data-preview-root]').waitFor();
  // Images that load after hydration (Avatar loads its image in JS) must be in the shot.
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  if (isDark !== (theme === 'dark')) throw new Error(`${page.url()}: expected ${theme}, <html> has dark=${isDark}`);
  return { page, errors, close: () => context.close() };
}

/** The example a component page opens with (its first `<ComponentPreview>`), usually `<name>-demo`. */
function heroExample(name: string) {
  const file = ['components', 'charts'].map((folder) => `content/docs/${folder}/${name}.mdx`).find((path) => existsSync(path)) ?? `content/docs/components/${name}.mdx`;
  const hero = existsSync(file) ? /<ComponentPreview\s+name="([^"]+)"/.exec(readFileSync(file, 'utf8'))?.[1] : undefined;
  if (!hero) throw new Error(`${file}: expected a docs page that opens with <ComponentPreview name="…" />`);
  return hero;
}

/**
 * The example a thumbnail shows: `<name>-thumb` when it exists, else a component page's hero or a block variant's
 * demo, which its block category page shows.
 */
function thumbnailExample(isBlock: boolean, name: string) {
  if (existsSync(`registry/kosmos/examples/${name}-thumb.tsx`)) return `${name}-thumb`;
  return isBlock ? `${name}-demo` : heroExample(name);
}

/**
 * Every component and block with its thumbnail source and frame. Blocks lay out in a desktop-wide frame;
 * `minWidth` caps the zoom on small examples such as a single badge.
 */
function thumbnailTargets() {
  const items = readRegistryItems().filter((item) => item.type === 'registry:ui' || item.type === 'registry:block');
  const unknown = names.filter((name) => !items.some((item) => item.name === name));
  if (unknown.length) throw new Error(`no component or block named ${unknown.join(', ')}`);
  return items
    .filter((item) => names.length === 0 || names.includes(item.name))
    .map((item) => {
      const isBlock = item.type === 'registry:block';
      // A wide chart card is taller than a component's 350px frame, so it gets a larger one at the same image size. A
      // ring is compact and keeps the component frame.
      const isChart = componentDocsFolder(item) === 'charts' && item.meta?.group !== 'chart-ring';
      return {
        name: item.name,
        example: thumbnailExample(isBlock, item.name),
        viewport: isBlock ? { width: 960, height: 600 } : isChart ? { width: 720, height: 450 } : { width: 560, height: 350 },
        minWidth: isBlock ? 480 : 320,
        deviceScaleFactor: isBlock ? 1.5 : isChart ? 1.6 : 2,
      };
    });
}

/**
 * Grows the viewport to the page's full height before a full-page shot. Pinned overlays (an open menu,
 * select or tooltip) position against the viewport, so below its first screen they would flip toward it
 * or stick to its edge; in one viewport as tall as the page they sit where they do for a user who scrolled there.
 */
async function fitViewportToPage(page: Page, width: number) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  if (height <= reviewHeight) return;
  await page.setViewportSize({ width, height });
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
}

async function shootReview(browser: Browser) {
  let failed = false;
  for (const name of names) {
    for (const theme of themes) {
      for (const width of widths) {
        const { page, errors, close } = await openPage(browser, values.path ?? `/view/${name}?theme=${theme}`, theme, { width, height: reviewHeight }, 2);
        const file = `${outDir}/${name}-${theme}-${width}.png`;
        await fitViewportToPage(page, width);
        await page.screenshot({ path: file, fullPage: true, animations: 'disabled', caret: 'hide' });
        if (errors.length) failed = true;
        console.log(file + (errors.length ? `  page errors: ${errors.join(' | ')}` : ''));
        await close();
      }
    }
  }
  return failed;
}

/**
 * A 16:10 box around what the example draws (text, controls, filled or shadowed surfaces, but not the empty
 * wrappers around them) with 24px of room, at least `minWidth` wide and inside the viewport, so small
 * examples fill the thumbnail instead of floating in the middle of it. Popups portalled to `<body>` (a pinned
 * tooltip or select list) count too.
 */
function contentClip(minWidth: number) {
  const room = 24;
  const aspect = 16 / 10;
  const rects: DOMRect[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node instanceof Text) {
      if (!node.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      rects.push(range.getBoundingClientRect());
      continue;
    }
    const element = node as Element;
    const style = getComputedStyle(element);
    const paints =
      element.childElementCount === 0 ||
      element instanceof SVGElement ||
      style.boxShadow !== 'none' ||
      !/rgba\(0, 0, 0, 0\)|transparent/.test(style.backgroundColor) ||
      style.backgroundImage !== 'none';
    if (paints && style.visibility !== 'hidden') rects.push(element.getBoundingClientRect());
  }
  const visible = rects.filter((rect) => rect.width > 0 && rect.height > 0);
  const left = Math.min(...visible.map((rect) => rect.left)) - room;
  const top = Math.min(...visible.map((rect) => rect.top)) - room;
  const right = Math.max(...visible.map((rect) => rect.right)) + room;
  const bottom = Math.max(...visible.map((rect) => rect.bottom)) + room;
  const { innerWidth, innerHeight } = window;
  let width = Math.min(innerWidth, Math.max(minWidth, right - left, (bottom - top) * aspect));
  let height = width / aspect;
  if (height > innerHeight) [height, width] = [innerHeight, innerHeight * aspect];
  const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);
  return {
    x: clamp((left + right - width) / 2, innerWidth - width),
    y: clamp((top + bottom - height) / 2, innerHeight - height),
    width,
    height,
  };
}

async function shootThumbnails(browser: Browser) {
  let failed = false;
  for (const target of thumbnailTargets()) {
    for (const theme of themes) {
      const { page, errors, close } = await openPage(browser, `/view/${target.example}?theme=${theme}`, theme, target.viewport, target.deviceScaleFactor);
      const file = `${outDir}/${target.name}-${theme}.png`;
      await page.addStyleTag({ content: '* { scrollbar-width: none; }' });
      const clip = await page.evaluate(contentClip, target.minWidth);
      await page.screenshot({ path: file, clip, animations: 'disabled', caret: 'hide' });
      if (errors.length) failed = true;
      console.log(file + (errors.length ? `  page errors: ${errors.join(' | ')}` : ''));
      await close();
    }
  }
  // next/image keeps serving its optimized copy of a replaced file until the cache entry expires.
  await Promise.all(['.next/cache/images', '.next/dev/cache/images'].map((dir) => rm(dir, { recursive: true, force: true })));
  return failed;
}

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
  failed = values.thumbnails ? await shootThumbnails(browser) : await shootReview(browser);
} finally {
  await browser.close();
}
if (failed) process.exit(1);
