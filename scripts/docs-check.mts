// Usage: pnpm docs:check [--port 3000 | --base http://localhost:3000] [--only <text>]
// Checks the docs site from a running dev server in a real browser: each check opens pages and asserts what a
// visitor sees. Prints one line per check; exits 1 when any check fails. --only runs the checks whose name holds <text>.
// Pro variants: the checks read NEXT_PUBLIC_KOSMOS_PRO_URL (from the environment or .env.local) as the dev server does,
// so run both with the same value. Unset, they assert the site shows no Pro variant; set, that it shows each one live
// from the Pro deployment, which must be running too.
import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { chromium, type Browser, type Page } from 'playwright';
import { chosenPreset, presetCss, presetPalette, presets } from '../lib/presets/index.ts';
import { readProVariants } from '../lib/registry.ts';
import { sitePresetCss } from '../lib/site-preset.ts';
import { proDeploymentUrl, proUrl } from '../lib/shared.ts';
import { exampleNames, sweepRoutes } from './focus-clip.mts';
import { openSitePage, serverBase, serverOptions, type ReducedMotion } from './site.mts';

const { values } = parseArgs({
  options: {
    ...serverOptions,
    only: { type: 'string' },
  },
});

const base = serverBase(values);
const phone = { width: 375, height: 800 };
const desktop = { width: 1280, height: 800 };

type Viewport = { width: number; height: number };

/** Opens `path` in light mode, with reduced motion unless asked. Page errors fail the check that opened it when it closes. */
async function openPage(browser: Browser, path: string, viewport: Viewport = desktop, reducedMotion: ReducedMotion = 'reduce') {
  const { page, context, errors } = await openSitePage(browser, base, path, { viewport, reducedMotion });
  await page.evaluate(() => document.fonts.ready);
  return {
    page,
    close: async () => {
      await context.close();
      assert.deepEqual(errors, [], `${path}: page errors`);
    },
  };
}

async function fetchText(path: string, init?: RequestInit) {
  const response = await fetch(new URL(path, base), init);
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  return response.text();
}

/** The computed color of a CSS variable, in the same notation `getComputedStyle` reports text colors in. */
function cssColor(page: Page, variable: string) {
  return page.evaluate((name) => {
    const probe = document.body.appendChild(document.createElement('span'));
    probe.style.color = `var(${name})`;
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, variable);
}

const docsSidebar = (page: Page) => page.locator('nav[aria-label="Docs"]:visible');

/** The address of every page link in the visible docs sidebar, including links inside closed groups. */
function sidebarLinks(page: Page) {
  return docsSidebar(page).evaluate((nav) => [...nav.querySelectorAll('a[href]')].map((link) => new URL((link as HTMLAnchorElement).href).pathname));
}

const tabs = [
  {
    label: 'Docs',
    pages: ['/docs', '/docs/installation', '/docs/foundations/color', '/docs/changelog', '/docs/changelog/2026-10-11-button'],
    owns: (url: string) => url.startsWith('/docs') && !url.startsWith('/docs/components') && !url.startsWith('/docs/blocks'),
    mustList: ['/docs', '/docs/installation', '/docs/foundations/color', '/docs/changelog'],
  },
  {
    label: 'Components',
    pages: ['/docs/components', '/docs/components/button'],
    owns: (url: string) => url.startsWith('/docs/components'),
    mustList: ['/docs/components', '/docs/components/button', '/docs/components/sidebar'],
  },
  {
    label: 'Blocks',
    pages: ['/docs/blocks', '/docs/blocks/data-table'],
    owns: (url: string) => url.startsWith('/docs/blocks'),
    mustList: ['/docs/blocks', '/docs/blocks/data-table'],
  },
] as const;

/** Asserts the header marks `label` as the current tab, in `accent-text`. */
async function assertCurrentTab(page: Page, label: string, where: string) {
  const current = page.locator('nav[aria-label="Site"]:visible a[aria-current="page"]');
  assert.equal(await current.count(), 1, `${where}: one current tab`);
  assert.equal((await current.textContent())?.trim(), label, `${where}: current tab`);
  const color = await current.evaluate((link) => getComputedStyle(link).color);
  assert.equal(color, await cssColor(page, '--accent-text'), `${where}: current tab color`);
}

/** The addresses of the 8 blocks before block categories; each is now the page of its category. */
const oldBlockUrls = [
  'app-sidebar',
  'command-menu',
  'data-table',
  'detail-drawer',
  'kanban-board',
  'new-item-dialog',
  'page-header',
  'stats-overview',
].map((name) => `/docs/blocks/${name}`);

type AuthoredItem = { name: string; type: string; categories?: string[]; meta?: { section?: string } };

/** The registry items as authored, read straight from their files: what the site's lists and counts must match. */
const authoredItems = globSync('registry/**/*.registry.json').map((file) => JSON.parse(readFileSync(file, 'utf8')) as AuthoredItem);
const authoredBlocks = authoredItems.filter((item) => item.type === 'registry:block');
const categoryUrl = (block: AuthoredItem) => `/docs/blocks/${block.categories![0]}`;

/** The page of every block category in a section, A–Z. */
function categoryUrls(section: string) {
  return [...new Set(authoredBlocks.filter((block) => block.meta?.section === section).map(categoryUrl))].sort();
}

/** The Pro variants the dev server shows: none unless the Pro deployment is set. */
const proVariants = readProVariants();

/** How many variants the block category at `url` holds: its free variants and the Pro ones the site shows. */
const variantCount = (url: string) =>
  authoredBlocks.filter((block) => categoryUrl(block) === url).length + proVariants.filter((variant) => `/docs/blocks/${variant.category}` === url).length;

const blockViewer = (page: Page, name: string) => page.locator(`[data-block-variant][id="${name}"]`);

type Check = { name: string; run: (browser: Browser) => Promise<void> };

/** Runs `work` over `items`, `size` at a time, and returns the results in order. */
async function inBatches<T, R>(items: T[], size: number, work: (item: T) => Promise<R>) {
  const results: R[] = [];
  const queue = items.map((item, index) => ({ item, index }));
  await Promise.all(
    Array.from({ length: size }, async () => {
      for (let next = queue.shift(); next; next = queue.shift()) results[next.index] = await work(next.item);
    }),
  );
  return results;
}

/** Every docs page the sitemap lists, plus the internal Tokens page. */
async function docsPages() {
  const sitemap = await fetchText('/sitemap.xml');
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname).filter((path) => path.startsWith('/docs'));
  return [...new Set([...paths, '/tokens'])].sort();
}

type DocsPageProbe = { path: string; overflow: number; messages: string[] };
let docsProbe: Promise<DocsPageProbe[]> | undefined;

/** Opens every docs page once at 375px in dark and records its sideways scroll and its console errors and warnings; the two checks that read it share the visit. */
function probeDocsPages(browser: Browser) {
  docsProbe ??= docsPages().then((paths) =>
    inBatches(paths, 8, async (path) => {
      const context = await browser.newContext({ viewport: phone, colorScheme: 'dark', reducedMotion: 'reduce' });
      const messages: string[] = [];
      try {
        const page = await context.newPage();
        page.on('pageerror', (error) => messages.push(`error: ${error.message}`));
        page.on('console', (message) => {
          if (message.type() === 'error' || message.type() === 'warning') messages.push(`${message.type()}: ${message.text().split('\n')[0]}`);
        });
        const response = await page.goto(new URL(path, base).href, { waitUntil: 'load' });
        assert.ok(response?.ok(), `${path} returned ${response?.status()}`);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(300);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        return { path, overflow, messages };
      } finally {
        await context.close();
      }
    }),
  );
  return docsProbe;
}

const checks: Check[] = [
  {
    name: 'each header tab shows only its own sidebar',
    async run(browser) {
      for (const tab of tabs) {
        for (const path of tab.pages) {
          const { page, close } = await openPage(browser, path);
          await assertCurrentTab(page, tab.label, path);
          const links = await sidebarLinks(page);
          const foreign = links.filter((url) => !tab.owns(url));
          assert.deepEqual(foreign, [], `${path}: sidebar links outside the ${tab.label} tab`);
          for (const url of tab.mustList) assert.ok(links.includes(url), `${path}: sidebar lists ${url}`);
          await close();
        }
      }
    },
  },
  {
    name: 'previous and next stay inside the tab',
    async run(browser) {
      for (const [path, rel] of [
        ['/docs/foundations/motion', 'next'],
        ['/docs/components', 'prev'],
        ['/docs/blocks', 'prev'],
      ] as const) {
        const { page, close } = await openPage(browser, path);
        const link = page.locator(`[data-docs-page-header] a[rel="${rel}"]`);
        assert.equal(await link.count(), 0, `${path}: ${rel} leaves the tab for ${await link.getAttribute('href').catch(() => '')}`);
        await close();
      }
    },
  },
  {
    name: 'the phone menu switches tabs and marks the current one',
    async run(browser) {
      const { page, close } = await openPage(browser, '/docs/components/button', phone);
      await page.getByRole('button', { name: 'Docs menu' }).click();
      await docsSidebar(page).waitFor();
      await assertCurrentTab(page, 'Components', 'phone menu');
      const foreign = (await sidebarLinks(page)).filter((url) => !url.startsWith('/docs/components'));
      assert.deepEqual(foreign, [], 'phone menu: sidebar links outside the Components tab');
      await page.locator('nav[aria-label="Site"]:visible').getByRole('link', { name: 'Blocks' }).click();
      await page.waitForURL('**/docs/blocks');
      await close();
    },
  },
  {
    name: 'count pills show only on closed groups and fade',
    async run(browser) {
      const { page, close } = await openPage(browser, '/docs/components/button');
      const triggers = docsSidebar(page).locator('[aria-expanded]:has([data-slot="sidebar-menu-badge"])');
      assert.ok((await triggers.count()) > 1, 'components sidebar has groups');
      await page.waitForFunction(() =>
        [...document.querySelectorAll('nav[aria-label="Docs"] [aria-expanded="true"] [data-slot="sidebar-menu-badge"]')].every(
          (badge) => getComputedStyle(badge).opacity === '0',
        ),
      );
      // The theme provider turns every transition off for a moment as it mounts; read the pills after that.
      await page.waitForFunction(() => Object.keys(document.querySelector('nav[aria-label="Docs"]') ?? {}).some((key) => key.startsWith('__reactProps$')));
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50))));
      for (const trigger of await triggers.all()) {
        const open = (await trigger.getAttribute('aria-expanded')) === 'true';
        const badge = trigger.locator('[data-slot="sidebar-menu-badge"]');
        const style = await badge.evaluate((element) => {
          const { opacity, transitionProperty, transitionDuration } = getComputedStyle(element);
          return { opacity, transitionProperty, transitionDuration };
        });
        const label = (await trigger.textContent()) ?? '';
        assert.equal(style.opacity, open ? '0' : '1', `${label}: pill opacity while ${open ? 'open' : 'closed'}`);
        assert.ok(style.transitionProperty.includes('opacity') && style.transitionDuration === '0.15s', `${label}: pill fades in 150ms`);
        const count = (await badge.textContent())?.trim();
        assert.match(label, new RegExp(`${count} components?`), `${label}: screen reader count`);
      }
      await close();
    },
  },
  {
    name: 'page titles take the site title role: 28px on phones, 32px on desktop',
    async run(browser) {
      for (const [viewport, size] of [
        [phone, '28px'],
        [desktop, '32px'],
      ] as const) {
        for (const path of ['/docs/installation', '/docs/components/button']) {
          const { page, close } = await openPage(browser, path, viewport);
          const fontSize = await page.locator('[data-docs-page-header] h1').evaluate((h1) => getComputedStyle(h1).fontSize);
          assert.equal(fontSize, size, `${path} at ${viewport.width}px: title size`);
          await close();
        }
      }
    },
  },
  {
    name: 'the Blocks sidebar shows only the block sections that have categories, each category with its variant count from two up',
    async run(browser) {
      const { page, close } = await openPage(browser, '/docs/blocks');
      const sections = await docsSidebar(page).evaluate((nav) =>
        [...nav.querySelectorAll('[data-slot="sidebar-group"]')].map((group) => ({
          label: group.querySelector('h2')?.textContent?.trim(),
          items: [...group.querySelectorAll('a[href]')].map((link) => ({
            url: new URL((link as HTMLAnchorElement).href).pathname,
            count: link.querySelector('[data-slot="sidebar-menu-badge"]')?.textContent?.trim(),
            isNew: link.querySelector('[data-slot="badge"]')?.textContent?.trim() === 'New',
            text: link.textContent?.replace(/\s+/g, ' ').trim(),
          })),
        })),
      );
      assert.deepEqual(
        sections.map((section) => section.label),
        ['Blocks', 'Application', 'Marketing', 'AI'],
        'sidebar sections',
      );
      const [, application, marketing, ai] = sections.map((section) => section.items);
      assert.deepEqual(ai.map((item) => item.url).sort(), categoryUrls('ai'), 'AI lists every AI block category');
      assert.deepEqual(application.map((item) => item.url).sort(), categoryUrls('application'), 'Application lists every application block category');
      assert.deepEqual(marketing.map((item) => item.url).sort(), categoryUrls('marketing'), 'Marketing lists every marketing block category');
      for (const url of oldBlockUrls) assert.ok(categoryUrls('application').includes(url), `Application keeps ${url}`);
      for (const url of ['/docs/blocks/hero', '/docs/blocks/bento', '/docs/blocks/footer']) assert.ok(categoryUrls('marketing').includes(url), `Marketing lists ${url}`);
      for (const item of [...application, ...marketing, ...ai]) {
        const count = variantCount(item.url);
        if (item.isNew) assert.equal(item.count, undefined, `${item.url}: New replaces the count`);
        else if (count > 1) {
          assert.equal(item.count, String(count), `${item.url}: variant count`);
          assert.match(item.text ?? '', new RegExp(`${count} variants`), `${item.url}: screen reader count`);
        } else assert.equal(item.count, undefined, `${item.url}: no count for one variant`);
      }
      await close();
    },
  },
  {
    name: 'the old block URLs lead to their category page, with the free variant and no On this page rail',
    async run(browser) {
      for (const path of oldBlockUrls) {
        const { page, close } = await openPage(browser, path);
        const name = path.split('/').pop()!;
        assert.equal(new URL(page.url()).pathname, path, `${path}: stays on its category page`);
        const variants = page.locator('[data-block-variant]');
        assert.equal(await variants.count(), 1, `${path}: one variant`);
        assert.equal(await variants.first().getAttribute('id'), name, `${path}: variant anchor`);
        assert.equal(await variants.first().getAttribute('data-tier'), 'free', `${path}: free variant`);
        assert.equal((await variants.first().locator('[data-slot="badge"]').textContent())?.trim(), 'Free', `${path}: Free badge`);
        assert.equal(await page.getByText('On this page', { exact: true }).count(), 0, `${path}: no On this page`);
        await close();
      }
      const markdown = await fetchText('/docs/blocks/data-table.md');
      assert.match(markdown, /## Data table \(Free\)/, 'data-table.md names the free variant');
      assert.match(markdown, /add @kosmos\/data-table/, 'data-table.md installs the free variant');
    },
  },
  {
    name: 'the block viewer sets the preview to desktop, tablet and phone width, and the block lays itself out for each',
    async run(browser) {
      const { page, close } = await openPage(browser, '/docs/blocks/stats-overview');
      const viewer = blockViewer(page, 'stats-overview');
      const frame = viewer.locator('iframe');
      await frame.scrollIntoViewIfNeeded();
      const stageWidth = await viewer.locator('[data-preview-stage]').evaluate((stage) => stage.clientWidth);
      const metricColumns = () =>
        frame
          .contentFrame()
          .locator('[data-preview-content] [role="tablist"]')
          .first()
          .evaluate((list) => getComputedStyle(list).gridTemplateColumns.split(' ').length);
      const widths = viewer.getByRole('radiogroup', { name: 'Preview width' });
      for (const [label, width, columns] of [
        ['Tablet', 768, 2],
        // At phone width each metric takes a row, so a value such as 144,600 never truncates.
        ['Phone', 375, 1],
        ['Desktop', stageWidth, 4],
      ] as const) {
        await widths.getByRole('radio', { name: label }).click();
        await page.waitForFunction(([iframe, expected]) => iframe.getBoundingClientRect().width === expected, [await frame.elementHandle(), width] as const);
        await frame.contentFrame().locator('[data-preview-content]').waitFor();
        assert.equal(await frame.contentFrame().locator('html').evaluate(() => innerWidth), width, `${label}: the block's viewport width`);
        assert.equal(await metricColumns(), columns, `${label}: metric columns in the block`);
        await page.screenshot({ path: `.screenshots/block-viewer-${label.toLowerCase()}.png`, fullPage: true });
      }
      assert.ok(stageWidth > 900, `Desktop: the viewer spans the content width (${stageWidth}px)`);
      await close();

      // Beside the sidebar on a small laptop the viewer is narrower than the tablet frame, so it offers no widths.
      const narrow = await openPage(browser, '/docs/blocks/stats-overview', { width: 1040, height: 800 });
      const narrowViewer = blockViewer(narrow.page, 'stats-overview');
      await narrowViewer.locator('iframe').scrollIntoViewIfNeeded();
      const narrowStage = await narrowViewer.locator('[data-preview-stage]').evaluate((stage) => stage.clientWidth);
      assert.ok(narrowStage < 770, `1040px window: the viewer is narrower than the tablet frame (${narrowStage}px)`);
      assert.equal(await narrowViewer.getByRole('radiogroup', { name: 'Preview width' }).isVisible(), false, '1040px window: no width control');
      assert.equal(await narrowViewer.locator('iframe').evaluate((iframe) => iframe.getBoundingClientRect().width), narrowStage, '1040px window: the preview fills the viewer');
      await narrow.close();
    },
  },
  {
    name: 'the block viewer works from the keyboard and names every control',
    async run(browser) {
      const { page, close } = await openPage(browser, '/docs/blocks/data-table');
      const viewer = blockViewer(page, 'data-table');
      const unnamed = await viewer.evaluate((root) =>
        [...root.querySelectorAll('button, a[href], [role="tab"], [role="radio"], iframe')]
          .filter((element) => !(element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent?.trim()))
          .map((element) => element.outerHTML.slice(0, 80)),
      );
      assert.deepEqual(unnamed, [], 'controls without an accessible name');
      const preview = viewer.getByRole('tab', { name: 'Preview' });
      await preview.focus();
      await page.keyboard.press('Shift+Tab');
      assert.equal(await viewer.getByRole('button', { name: /^Copy install command/ }).count(), 0, 'no install command in the viewer');
      assert.equal(await viewer.evaluate((root) => root.contains(document.activeElement)), false, 'the tabs come first in the viewer');
      await page.keyboard.press('Tab');
      assert.ok(await preview.evaluate((tab) => tab === document.activeElement), 'Tab returns to Preview');
      await page.keyboard.press('ArrowRight');
      assert.equal(await viewer.getByRole('tab', { name: 'Code' }).getAttribute('aria-selected'), 'true', 'ArrowRight selects Code');
      await viewer.locator('[data-slot="code-block"]').first().waitFor();
      await page.keyboard.press('ArrowLeft');
      await viewer.getByRole('radiogroup', { name: 'Preview width' }).waitFor();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Desktop', 'Tab reaches the selected width');
      await page.keyboard.press('ArrowRight');
      assert.equal(await viewer.getByRole('radio', { name: 'Tablet' }).getAttribute('aria-checked'), 'true', 'ArrowRight picks Tablet');
      await page.keyboard.press('Tab');
      const open = viewer.getByRole('link', { name: 'Open Data table in a new tab' });
      assert.ok(await open.evaluate((link) => link === document.activeElement), 'Tab reaches Open in a new tab');
      assert.equal(await open.getAttribute('target'), '_blank', 'opens a new tab');
      const [tab] = await Promise.all([page.context().waitForEvent('page'), open.click()]);
      await tab.waitForLoadState('load');
      assert.equal(new URL(tab.url()).pathname, '/view/data-table-demo', 'new tab address');
      assert.equal(await tab.locator('[data-preview-root]').count(), 1, 'new tab shows the block alone');
      assert.equal(await tab.locator('nav[aria-label="Docs"]').count(), 0, 'new tab has no docs chrome');
      await close();
    },
  },
  {
    name: 'the Code tab of the block viewer shows every file of the block at its install path',
    async run(browser) {
      for (const [category, files] of [
        ['data-table', ['components/data-table.tsx']],
        ['app-sidebar', ['components/app-sidebar.tsx']],
      ] as const) {
        const { page, close } = await openPage(browser, `/docs/blocks/${category}`);
        const viewer = blockViewer(page, category);
        await viewer.getByRole('tab', { name: 'Code' }).click();
        const panel = viewer.getByRole('tabpanel');
        await panel.locator('[data-slot="code-block"]').first().waitFor();
        const titles = await panel.locator('[data-slot="code-block"] figcaption').allTextContents();
        assert.deepEqual(titles, files, `${category}: file paths`);
        assert.match((await panel.locator('pre').first().textContent()) ?? '', /from '@\/components\/ui\//, `${category}: installed imports`);
        await close();
      }
    },
  },
  {
    name: 'switching the block viewer to Code moves nothing: same height, same toolbar, the code scrolls inside',
    async run(browser) {
      for (const category of ['data-table', 'hero']) {
        const { page, close } = await openPage(browser, `/docs/blocks/${category}`);
        const viewer = blockViewer(page, category);
        await viewer.locator('iframe').evaluate((frame) => new Promise((resolve) => (frame as HTMLIFrameElement).contentDocument?.readyState === 'complete' ? resolve(null) : frame.addEventListener('load', resolve)));
        await page.waitForTimeout(500);
        const newTab = viewer.getByRole('link', { name: /in a new tab$/ });
        const before = { height: (await viewer.boundingBox())!.height, x: (await newTab.boundingBox())!.x };
        await viewer.getByRole('tab', { name: 'Code' }).click();
        const code = viewer.getByRole('tabpanel').locator('[data-slot="code-block"] > [id]').first();
        await code.waitFor();
        assert.ok(Math.abs((await viewer.boundingBox())!.height - before.height) <= 1, `${category}: same height in Code`);
        assert.equal((await newTab.boundingBox())!.x, before.x, `${category}: the new tab button stays put`);
        const [clientHeight, scrollHeight] = await code.evaluate((element) => [element.clientHeight, element.scrollHeight]);
        assert.ok(scrollHeight > clientHeight, `${category}: the code scrolls inside`);
        await close();
      }
    },
  },
  {
    name: 'the data table fits the block viewer at desktop width, hiding columns before it scrolls sideways',
    async run(browser) {
      const { page, close } = await openPage(browser, '/docs/blocks/data-table');
      const table = blockViewer(page, 'data-table').frameLocator('iframe').locator('table');
      await table.waitFor();
      const [width, scroller] = await table.evaluate((element) => [element.scrollWidth, element.parentElement!.clientWidth]);
      assert.ok(width <= scroller, `table ${width}px fits its ${scroller}px frame`);
      assert.equal(await table.locator('thead th').filter({ hasText: 'Platform' }).isVisible(), false, 'Platform steps aside');
      await close();
    },
  },
  {
    name: 'Show all opens long code up to 75% of the screen, scrolls inside, and closes back to the top',
    async run(browser) {
      const { page, close } = await openPage(browser, '/docs/components/sidebar');
      await page.getByRole('tab', { name: 'Manual' }).first().click();
      const id = await page.getByRole('button', { name: 'Show all' }).first().getAttribute('aria-controls');
      const toggle = page.locator(`[aria-controls="${id}"]`);
      const code = page.locator(`[id="${id}"]`);
      await toggle.click();
      await page.waitForTimeout(500);
      const [clientHeight, scrollHeight] = await code.evaluate((element) => [element.clientHeight, element.scrollHeight]);
      assert.ok(clientHeight <= desktop.height * 0.75 + 1, `${clientHeight}px is at most 75% of the screen`);
      assert.ok(scrollHeight > clientHeight, 'the rest scrolls inside');
      assert.equal(await code.getAttribute('tabindex'), '0', 'the keyboard can scroll it');
      await code.evaluate((element) => (element.scrollTop = element.scrollHeight));
      await toggle.click();
      await page.waitForTimeout(500);
      assert.equal(await code.evaluate((element) => element.scrollTop), 0, 'closes back to the top');
      await close();
    },
  },
  {
    name: 'a component example has Preview and Code tabs, no peek, and Code opens at the height of the preview',
    async run(browser) {
      const { page, close } = await openPage(browser, '/docs/components/sidebar');
      const frame = page.locator('[data-slot="preview-shell"]').first();
      assert.equal(await page.getByRole('button', { name: 'Show code' }).count(), 0, 'no Show code peek');
      assert.equal(await page.locator('[data-docs-page-header] [aria-label^="Copy install command"]').count(), 0, 'no install command under the title');
      const stageHeight = await frame.locator('[data-preview-stage]').evaluate((stage) => stage.getBoundingClientRect().height);
      await frame.getByRole('tab', { name: 'Code' }).click();
      const panel = frame.getByRole('tabpanel', { name: 'Code' });
      await panel.waitFor();
      const panelHeight = await panel.evaluate((element) => element.getBoundingClientRect().height);
      assert.ok(Math.abs(panelHeight - stageHeight) <= 1, `Code opens at ${stageHeight}px, not ${panelHeight}px`);
      assert.match((await panel.locator('pre').first().textContent()) ?? '', /from '@\/components\/ui\//, 'installed imports');
      assert.match((await frame.getByRole('link', { name: /^Open .* in a new tab$/ }).getAttribute('href')) ?? '', /^\/view\//, 'opens the example alone');
      await close();
    },
  },
  {
    name: 'the block viewer shows a Pro variant with a Pro badge, its live preview and its code locked',
    async run(browser) {
      const fixture = await fetch(new URL('/fixtures/pro-variant', base));
      // The fixture is a made-up Pro variant that exists only on a dev server; a production build must not serve it.
      if (fixture.status === 404) return;
      const { page, close } = await openPage(browser, '/fixtures/pro-variant');
      const viewer = page.locator('[data-block-variant][data-tier="pro"]');
      assert.equal(await viewer.count(), 1, 'one Pro variant');
      assert.equal((await viewer.locator('[data-slot="badge"]').textContent())?.trim(), 'Pro', 'Pro badge');
      assert.equal(await viewer.getByRole('button', { name: /^Copy install command/ }).count(), 0, 'no install command');
      assert.ok(((await viewer.locator('iframe').getAttribute('src')) ?? '').length > 0, 'live preview');
      await viewer.getByRole('tab', { name: 'Code' }).click();
      const panel = viewer.getByRole('tabpanel');
      assert.equal(await panel.locator('[data-slot="code-block"]').count(), 0, 'no code');
      if (proUrl) assert.equal(await panel.getByRole('link', { name: 'Get Pro' }).getAttribute('href'), proUrl, 'link to Pro');
      else assert.equal(await panel.getByRole('link').count(), 0, 'no link to Pro while there is no store');
      const free = page.locator('[data-block-variant][data-tier="free"]');
      assert.equal(await free.count(), 1, 'the free variant stays first');
      assert.ok(
        await free.evaluate((section, pro) => !!(section.compareDocumentPosition(pro!) & Node.DOCUMENT_POSITION_FOLLOWING), await viewer.elementHandle()),
        'free before Pro',
      );
      await close();
    },
  },
  {
    name: proDeploymentUrl
      ? 'with the Pro deployment set, each Pro variant shows on its category page, live from the deployment in the docs theme'
      : 'without the Pro deployment, no page shows a Pro variant',
    async run(browser) {
      for (const url of [...new Set(authoredBlocks.map(categoryUrl))]) {
        const { page, close } = await openPage(browser, url);
        const expected = proVariants.filter((variant) => `/docs/blocks/${variant.category}` === url);
        const viewers = page.locator('[data-block-variant][data-tier="pro"]');
        assert.deepEqual(await viewers.evaluateAll((sections) => sections.map((section) => section.id)), expected.map((variant) => variant.name), `${url}: Pro variants`);
        for (const variant of expected) {
          const viewer = blockViewer(page, variant.name);
          assert.equal((await viewer.locator('[data-slot="badge"]').textContent())?.trim(), 'Pro', `${variant.name}: Pro badge`);
          assert.equal(await viewer.getByRole('button', { name: /^Copy install command/ }).count(), 0, `${variant.name}: no install command`);
          const frame = viewer.locator('iframe');
          await frame.scrollIntoViewIfNeeded();
          const src = new URL((await frame.getAttribute('src')) ?? '');
          assert.equal(`${src.origin}${src.pathname}`, variant.previewUrl, `${variant.name}: preview from the Pro deployment`);
          assert.equal(src.searchParams.get('theme'), 'light', `${variant.name}: preview in the docs theme`);
          // The preview is live: the Pro page renders, and reports its height so the frame fits it.
          await frame.contentFrame().locator('[data-preview-content] h1, [data-preview-content] h2').first().waitFor({ timeout: 15_000 });
          assert.ok((await frame.evaluate((element) => element.getBoundingClientRect().height)) >= 560, `${variant.name}: frame height`);
          await viewer.getByRole('tab', { name: 'Code' }).click();
          assert.equal(await viewer.getByRole('tabpanel').locator('[data-slot="code-block"]').count(), 0, `${variant.name}: code locked`);
        }
        await close();
        const markdown = await fetchText(`${url}.md`);
        for (const variant of expected) assert.ok(markdown.includes(`## ${variant.title} (Pro)\n`) && markdown.includes(variant.previewUrl), `${url}.md lists ${variant.name}`);
        if (!expected.length) assert.doesNotMatch(markdown, /\(Pro\)/, `${url}.md lists no Pro variant`);
      }
    },
  },
  {
    name: 'the landing is an ordered list of sections, with the stack under the hero and no "Built with" labels',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const ids = await page.locator('[data-landing-section]').evaluateAll((elements) => elements.map((section) => section.getAttribute('data-landing-section')));
      assert.deepEqual(
        ids,
        ['hero', 'stack', 'features', 'showcase', 'pricing', 'faq', 'cta', 'footer'],
        'the landing runs hero, stack, features, showcase, pricing, FAQ, CTA and footer, in that order',
      );
      assert.equal(await page.locator('[data-slot="testimonials"], [data-slot^="testimonial"]').count(), 0, 'no testimonials on the landing');
      assert.equal(await page.locator('[data-block-label]').count(), 0, 'no "Built with" labels');
      assert.equal(await page.getByText('Built with', { exact: false }).count(), 0, 'no "Built with" text');
      assert.equal(await page.locator('main [data-slot="preset-picker"], main [role="radiogroup"][aria-label="Preset"]').count(), 0, 'no preset controls on the landing');
      const tabs = page.locator('[data-landing-section="showcase"]').getByRole('tablist', { name: 'Screens' });
      assert.deepEqual(await tabs.getByRole('tab').allTextContents(), ['Dashboard', 'Roadmap', 'Auth', 'Settings'], 'one tab per screen');
      assert.equal(await page.locator('[role="dialog"]:visible, [role="alertdialog"]:visible').count(), 0, 'nothing pops up on load');
      await close();
    },
  },
  {
    name: 'the hero shows the title, one line, Get started, Browse blocks and a copyable install command, and the Projects data table in a flat browser frame with a glow',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const hero = page.locator('[data-landing-section="hero"]');
      assert.equal(await hero.locator('h1').count(), 1, 'one h1');
      const description = hero.locator('[data-slot="hero-description"]');
      assert.equal(await description.count(), 1, 'one line under the title');
      assert.match((await description.textContent()) ?? '', /^Base UI components and dashboard blocks you own/, 'the line promises what you get');
      assert.ok((await description.evaluate((element) => element.getBoundingClientRect().height)) < 40, 'the line stays on one line at 1280px');
      assert.equal(await hero.getByRole('link', { name: 'Get started' }).getAttribute('href'), '/docs/installation', 'Get started');
      assert.equal(await hero.getByRole('link', { name: 'Browse blocks' }).getAttribute('href'), '/docs/blocks', 'Browse blocks');
      assert.equal(await hero.locator('[data-slot="hero-install"] input').inputValue(), 'npx shadcn@latest add @kosmos/data-table', 'the install command');
      assert.equal(await hero.locator('[data-slot="hero-install"]').getByRole('button', { name: 'Copy install command' }).count(), 1, 'a button copies it');
      const product = hero.locator('[data-slot="hero-product"] [data-slot="browser-frame"]');
      assert.equal(await product.locator('[data-slot="data-table"]').count(), 1, 'the data table in the frame');
      assert.equal(await product.getByRole('heading', { name: 'Projects', includeHidden: true }).count(), 1, 'it is the Projects screen');
      assert.equal(await hero.locator('[data-slot="stats-overview"]').count(), 0, 'not the overview');
      assert.equal(await hero.locator('[data-slot="glow"]').count(), 1, 'the glow behind it');
      assert.equal(await hero.locator('[data-slot="hero-announcement"]').count(), 0, 'no announcement');
      const clearOfActions = await hero.evaluate((section) => {
        const glow = section.querySelector('[data-slot="hero-product-glow"]')!.getBoundingClientRect();
        const last = section.querySelector('[data-slot="hero-install"]')!.getBoundingClientRect();
        return glow.top - last.bottom;
      });
      assert.ok(clearOfActions >= 0, `the glow starts ${clearOfActions}px below the install command, never behind the buttons`);
      const variants = await openPage(browser, '/docs/blocks/hero');
      const variant = variants.page.locator('[data-block-variant]');
      assert.deepEqual(await variant.evaluateAll((items) => items.map((item) => item.id)), ['hero', 'hero-product'], 'the Hero category page shows the hero and hero-product variants');
      assert.deepEqual(await variant.evaluateAll((items) => items.map((item) => item.getAttribute('data-tier'))), ['free', 'free'], 'both Hero variants are free');
      await variants.close();
      await close();
    },
  },
  {
    name: 'the hero frame never tilts, stays crisp once settled, and its table hides columns before it would scroll sideways',
    async run(browser) {
      for (const viewport of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }, phone]) {
        const { page, close } = await openPage(browser, '/', viewport, 'no-preference');
        await page.waitForFunction(() => document.querySelector('[data-landing-section="hero"] [data-slot="browser-frame"]')!.getAnimations({ subtree: true }).every((animation) => animation.playState === 'finished'), undefined, { timeout: 8000 });
        const frame = await page.locator('[data-landing-section="hero"] [data-slot="hero-product"]').evaluate((product) => {
          const softened: string[] = [];
          for (let element = product.querySelector<HTMLElement>('[data-slot="browser-frame"]'); element && element !== product.parentElement; element = element.parentElement) {
            const style = getComputedStyle(element);
            if (style.transform !== 'none' || style.rotate !== 'none' || style.scale !== 'none') softened.push(`${element.dataset.slot ?? element.tagName}: transformed`);
            if (style.filter !== 'none' || style.backdropFilter !== 'none') softened.push(`${element.dataset.slot ?? element.tagName}: filtered`);
            if (style.perspective !== 'none') softened.push(`${element.dataset.slot ?? element.tagName}: perspective`);
          }
          const inside = [...product.querySelectorAll<HTMLElement>('[data-slot="browser-frame"] *')].filter((element) => {
            const style = getComputedStyle(element);
            const identity = style.transform === 'none' || style.transform === 'matrix(1, 0, 0, 1, 0, 0)';
            const edgeFade = element.dataset.slot === 'scroll-area-viewport';
            return style.filter !== 'none' || (style.maskImage !== 'none' && !edgeFade) || !identity;
          });
          const frameBox = product.querySelector('[data-slot="browser-frame"]')!.getBoundingClientRect();
          const overlays = [...product.querySelectorAll<HTMLElement>(':scope > div:last-child *')].filter((element) => /gradient/.test(getComputedStyle(element).backgroundImage) && element.getBoundingClientRect().bottom > frameBox.bottom - 4 && element.closest('[data-slot="hero-product-glow"]') === null);
          return { softened, softenedInside: inside.map((element) => element.dataset.slot ?? element.tagName), overlays: overlays.length };
        });
        assert.deepEqual(frame.softened, [], `${viewport.width}px: the frame and its ancestors have no transform, filter or perspective`);
        assert.deepEqual(frame.softenedInside, [], `${viewport.width}px: nothing inside the frame is transformed, blurred or masked`);
        assert.equal(frame.overlays, 0, `${viewport.width}px: no gradient covers the bottom of the frame`);
        const scrolling = await page.locator('[data-landing-section="hero"] [data-slot="data-table"]').evaluate((table) =>
          [table, ...table.querySelectorAll<HTMLElement>('*')]
            .filter((element) => element.scrollWidth > element.clientWidth + 1 && (element.tagName === 'TABLE' || ['auto', 'scroll'].includes(getComputedStyle(element).overflowX)))
            .map((element) => `${element.tagName} ${element.scrollWidth}>${element.clientWidth}`),
        );
        assert.deepEqual(scrolling, [], `${viewport.width}px: the hero table does not scroll sideways`);
        assert.ok((await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, `${viewport.width}px: the page does not scroll sideways`);
        await close();
      }
    },
  },
  {
    name: 'the landing moves as one system: sections rise once and stay, titles are one block, cards lift, the hero frame waits for the title',
    async run(browser) {
      const { page, close } = await openPage(browser, '/', desktop, 'no-preference');
      assert.equal(await page.locator('[data-slot="text-reveal"]').count(), 1, 'only the hero title reveals word by word');
      assert.equal(await page.locator('[data-landing-section="hero"] h1 [data-slot="text-reveal"]').count(), 1, 'the hero title is that one');
      assert.equal(await page.locator('[data-landing-section="cta"] [data-slot="text-reveal"]').count(), 0, 'the CTA title is not scroll-scrubbed');
      const hero = await page.locator('[data-landing-section="hero"]').evaluate((section) => {
        const timing = (selector: string) => {
          const style = getComputedStyle(section.querySelector(selector)!);
          return { name: style.animationName, delay: Number.parseFloat(style.animationDelay) * 1000, duration: Number.parseFloat(style.animationDuration) * 1000 };
        };
        return { line: timing('[data-slot="hero-description"]'), actions: timing('[data-slot="hero-actions"]'), frame: timing('[data-slot="browser-frame"]') };
      });
      assert.deepEqual(hero.line, hero.actions, 'the line and the actions come in as one block');
      assert.ok(hero.line.duration <= 300 && hero.line.delay < 500, 'the block is short and starts with the title');
      assert.ok(hero.frame.delay >= 1200, `the frame starts at ${hero.frame.delay}ms, after the 7-word title has finished`);
      const below = page.locator('[data-landing-section="pricing"] [data-slot="pricing-plan"]').first();
      assert.equal(await below.evaluate((element) => getComputedStyle(element).opacity), '0', 'a part below the fold waits hidden');
      await below.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('[data-landing-section="pricing"] [data-slot="pricing-plan"]')!).opacity) === 1, undefined, { timeout: 4000 });
      await page.evaluate(() => scrollTo(0, 0));
      await page.evaluate(() => scrollTo(0, document.querySelector('[data-landing-section="pricing"]')!.getBoundingClientRect().top + scrollY));
      assert.equal(await below.evaluate((element) => getComputedStyle(element).opacity), '1', 'it stays once shown and never replays');
      await page.evaluate(() => scrollTo(0, 0));
      assert.equal(await page.locator('[data-reveal]').evaluateAll((elements) => elements.filter((element) => (element as HTMLElement).dataset.reveal === 'hidden').length > 0), true, 'the parts further down still wait');
      await close();
      const reduced = await openPage(browser, '/', desktop, 'reduce');
      const rise = await reduced.page.locator('[data-landing-section="pricing"]').evaluate((section) => getComputedStyle(section).getPropertyValue('--m-rise').trim());
      assert.equal(rise, '0px', 'under reduced motion a section only fades');
      await reduced.close();
    },
  },
  {
    name: 'the stack strip names Base UI, Tailwind CSS, React, Next.js and the shadcn CLI, each with its mark',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const list = page.locator('[data-landing-section="stack"] [data-slot="logo-marquee"]').getByRole('list');
      assert.equal(
        await list.ariaSnapshot(),
        ['- list "Built on the stack you already use":', ...['Base UI', 'Tailwind CSS', 'React', 'Next.js', 'shadcn CLI'].map((name) => `  - listitem: ${name}`)].join('\n'),
        'one list of the stack, each item named once',
      );
      assert.equal(await list.locator('li svg').count(), 5, 'each item shows a mark');
      await close();
    },
  },
  {
    name: 'the pricing shows Free and Pro, Pro raised, and the brand colour only on the logo',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const pricing = page.locator('[data-landing-section="pricing"]');
      const plans = pricing.locator('[data-slot="pricing-plan"]');
      assert.deepEqual(await plans.locator('h3').allTextContents(), ['Free', 'Pro'], 'Free and Pro');
      assert.equal(await plans.nth(1).getAttribute('data-featured'), '', 'Pro is the raised plan');
      const brand = await cssColor(page, '--brand');
      const branded = await page.evaluate((color) => {
        const marks: string[] = [];
        for (const element of document.querySelectorAll('body *')) {
          const style = getComputedStyle(element);
          if ([style.color, style.backgroundColor, style.fill, style.stroke].includes(color)) {
            const section = element.closest('[data-landing-section], header');
            marks.push(`${section?.getAttribute('data-landing-section') ?? section?.tagName.toLowerCase()}:${element.tagName.toLowerCase()}:${element.textContent?.trim() ?? ''}`);
          }
        }
        return marks;
      }, brand);
      const outside = branded.filter((mark) => !/^(header|footer):(svg|g|circle|path|ellipse)/.test(mark));
      assert.deepEqual(outside, [], 'the brand colour shows nowhere but the logo');
      await close();
    },
  },
  {
    name: 'the landing shows its content without JavaScript',
    async run(browser) {
      const context = await browser.newContext({ viewport: desktop, javaScriptEnabled: false, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(new URL('/', base).href, { waitUntil: 'load' });
      const visible = async (selector: string, text: string | RegExp) => {
        const target = page.locator(selector).getByText(text).first();
        assert.ok(await target.isVisible(), `${selector}: "${text}" shows without JavaScript`);
      };
      await visible('[data-landing-section="hero"]', 'Dashboard UI with the details already done');
      await visible('[data-landing-section="hero"]', 'Fernhill Books');
      await visible('[data-landing-section="hero"]', 'Base UI components and dashboard blocks you own');
      await visible('[data-landing-section="stack"]', 'Tailwind CSS');
      await visible('[data-landing-section="showcase"]', 'acme.example/projects');
      await visible('[data-landing-section="features"]', 'Go to Projects');
      await visible('[data-landing-section="pricing"]', 'Pay once');
      await visible('[data-landing-section="faq"]', 'Is Kosmos UI free?');
      await visible('[data-landing-section="cta"]', 'Read the installation guide');
      await visible('[data-landing-section="footer"]', 'Introduction');
      await context.close();
      const moving = await browser.newContext({ viewport: desktop, javaScriptEnabled: false, reducedMotion: 'no-preference' });
      const movingPage = await moving.newPage();
      await movingPage.goto(new URL('/', base).href, { waitUntil: 'load' });
      await movingPage.waitForTimeout(2800);
      for (const selector of ['[data-slot="hero-actions"]', '[data-slot="hero-install"]', '[data-slot="browser-frame"]', '[data-slot="hero-product-glow"]']) {
        assert.equal(await movingPage.locator(`[data-landing-section="hero"] ${selector}`).evaluate((element) => getComputedStyle(element).opacity), '1', `${selector} has come in without JavaScript`);
      }
      for (const id of ['stack', 'features', 'showcase', 'pricing', 'faq', 'cta']) {
        assert.equal(await movingPage.locator(`[data-landing-section="${id}"] [data-reveal]`).count(), 0, `${id}: nothing waits hidden without JavaScript`);
        assert.equal(await movingPage.locator(`[data-landing-section="${id}"] [data-landing-content]`).evaluate((element) => getComputedStyle(element).opacity), '1', `${id}: visible without JavaScript`);
      }
      await moving.close();
    },
  },
  {
    name: 'the footer is the page footer, built from the Footer block, with real links',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const footer = page.getByRole('contentinfo');
      assert.equal(await footer.count(), 1, 'one contentinfo landmark');
      assert.equal(await footer.getAttribute('data-slot'), 'footer', 'the Footer block');
      const hrefs = await footer.locator('a[href]').evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
      for (const href of hrefs) assert.doesNotMatch(href, /#$|\.example/, `${href}: a real link`);
      for (const host of ['github.com', 'x.com', 'linkedin.com']) {
        assert.ok(hrefs.some((href) => new URL(href).hostname.endsWith(host)), `links to ${host}`);
      }
      for (const href of hrefs.filter((href) => new URL(href).origin === new URL(base).origin)) await fetchText(new URL(href).pathname);
      const variants = await openPage(browser, '/docs/blocks/footer');
      const variant = variants.page.locator('[data-block-variant]');
      assert.equal(await variant.count(), 1, 'the Footer category page shows one variant');
      assert.equal(await variant.getAttribute('id'), 'footer', 'the free Footer variant');
      assert.equal(await variant.getAttribute('data-tier'), 'free', 'Footer is free');
      await variants.close();
      await close();
    },
  },
  {
    name: 'the logo marquee moves, eases to a stop while the pointer is on it or until its pause button is pressed again, stands still under reduced motion, and names every logo',
    async run(browser) {
      const settle = 1800;
      const path = '/view/logo-marquee-demo';
      const names = ['Fernhill Books', 'Brightloop Fitness', 'Copperline Bank', 'Saltmarsh Coffee', 'Driftwood Travel', 'Cirrus Weather', 'Ironbark Logistics'];
      // `+ 0` turns the -0 of a still track into 0, which strict equality tells apart.
      const offsetOf = (page: Page) =>
        page.locator('[data-slot="logo-marquee-track"]').evaluate((track) => new DOMMatrix(getComputedStyle(track).transform).m41 + 0);

      const moving = await openPage(browser, path, desktop, 'no-preference');
      const marquee = moving.page.locator('[data-slot="logo-marquee"]');
      assert.equal(
        await marquee.getByRole('list').ariaSnapshot(),
        ['- list "Used by the teams behind":', ...names.map((name) => `  - listitem: ${name}`)].join('\n'),
        'one list, named by its line, with one named item per logo; the copies stay hidden',
      );
      const start = await offsetOf(moving.page);
      await moving.page.waitForTimeout(500);
      assert.ok((await offsetOf(moving.page)) < start, 'the logos move toward the start');
      await marquee.locator('[data-slot="logo-marquee-viewport"]').hover();
      const hovered = await offsetOf(moving.page);
      await moving.page.waitForTimeout(150);
      assert.ok((await offsetOf(moving.page)) < hovered, 'the logos glide on for a moment instead of halting');
      await moving.page.waitForTimeout(settle);
      const held = await offsetOf(moving.page);
      await moving.page.waitForTimeout(500);
      assert.equal(await offsetOf(moving.page), held, 'the logos stop while the pointer is on them');
      await moving.page.mouse.move(0, 0);
      await moving.page.waitForTimeout(500);
      assert.ok((await offsetOf(moving.page)) < held, 'the logos move again once the pointer leaves');
      await marquee.getByRole('button', { name: 'Pause logos' }).press('Enter');
      await moving.page.waitForTimeout(settle);
      const stopped = await offsetOf(moving.page);
      await moving.page.waitForTimeout(500);
      assert.equal(await offsetOf(moving.page), stopped, 'the pause button stops the logos until it is pressed again');
      await marquee.getByRole('button', { name: 'Play logos' }).press('Enter');
      await moving.page.waitForTimeout(500);
      assert.ok((await offsetOf(moving.page)) < stopped, 'the play button moves them again');
      await moving.close();

      const still = await openPage(browser, path);
      const stillMarquee = still.page.locator('[data-slot="logo-marquee"]');
      await stillMarquee.waitFor();
      await still.page.waitForTimeout(500);
      assert.equal(await offsetOf(still.page), 0, 'reduced motion: nothing moves');
      assert.equal(await stillMarquee.locator('li:visible').count(), names.length, 'reduced motion: each logo shows once');
      assert.equal(await stillMarquee.getByRole('button').count(), 0, 'reduced motion: nothing to pause');
      const box = (await stillMarquee.boundingBox())!;
      for (const item of await stillMarquee.locator('li:visible').all()) {
        const itemBox = (await item.boundingBox())!;
        assert.ok(itemBox.x >= box.x && itemBox.x + itemBox.width <= box.x + box.width, 'reduced motion: every logo fits in the row');
      }
      await still.close();
    },
  },
  {
    name: 'the testimonials wall moves its columns both ways, eases a column to a stop under the pointer, pauses with its button, and stands still with every quote once under reduced motion',
    async run(browser) {
      const path = '/view/testimonials-demo';
      const settle = 1800;
      const quotes = 9;
      // `+ 0` turns the -0 of a still track into 0, which strict equality tells apart.
      const offsets = (page: Page) =>
        page
          .locator('[data-slot="testimonials-column"]:visible > div')
          .evaluateAll((tracks) => tracks.map((track) => new DOMMatrix(getComputedStyle(track).transform).m42 + 0));

      const moving = await openPage(browser, path, desktop, 'no-preference');
      const wall = moving.page.locator('[data-slot="testimonials-wall"]');
      assert.equal(await moving.page.getByRole('figure').count(), quotes + 1, 'each quote, and the featured one, is one figure screen readers reach');
      const start = await offsets(moving.page);
      assert.equal(start.length, 3, 'three columns at 1280px');
      await moving.page.waitForTimeout(500);
      const later = await offsets(moving.page);
      const moved = later.map((offset, index) => Math.sign(offset - start[index]));
      assert.ok(moved.includes(-1) && moved.includes(1), `the columns move up and down: ${moved}`);
      const column = wall.locator('[data-slot="testimonials-column"]:visible').first();
      await column.hover({ position: { x: 40, y: 200 } });
      await moving.page.waitForTimeout(settle);
      const [held, ...others] = await offsets(moving.page);
      await moving.page.waitForTimeout(500);
      const [stillHeld, ...othersLater] = await offsets(moving.page);
      assert.equal(stillHeld, held, 'the column under the pointer stops');
      assert.notDeepEqual(othersLater, others, 'the other columns keep moving');
      await moving.page.mouse.move(0, 0);
      await wall.getByRole('button', { name: 'Pause testimonials' }).press('Enter');
      await moving.page.waitForTimeout(settle);
      const paused = await offsets(moving.page);
      await moving.page.waitForTimeout(500);
      assert.deepEqual(await offsets(moving.page), paused, 'the pause button stops every column');
      await wall.getByRole('button', { name: 'Play testimonials' }).press('Enter');
      await moving.page.waitForTimeout(500);
      assert.notDeepEqual(await offsets(moving.page), paused, 'the play button moves them again');
      await moving.close();

      const still = await openPage(browser, path);
      const stillWall = still.page.locator('[data-slot="testimonials-wall"]');
      await stillWall.waitFor();
      await still.page.waitForTimeout(500);
      assert.deepEqual(await offsets(still.page), [0, 0, 0], 'reduced motion: nothing moves');
      assert.equal(await stillWall.locator('[data-slot="testimonial"]:visible').count(), quotes, 'reduced motion: each quote shows once');
      assert.equal(await stillWall.getByRole('button').count(), 0, 'reduced motion: nothing to pause');
      const wallBox = (await stillWall.boundingBox())!;
      const lastCard = (await stillWall.locator('[data-slot="testimonial"]:visible').last().boundingBox())!;
      assert.ok(lastCard.y + lastCard.height <= wallBox.y + wallBox.height, 'reduced motion: the wall is as tall as its quotes');
      await still.close();
    },
  },
  {
    name: 'the pricing block switches between monthly and yearly prices and tells screen readers the new prices',
    async run(browser) {
      const { page, close } = await openPage(browser, '/view/pricing-demo');
      const pricing = page.locator('[data-slot="pricing"]');
      const billing = pricing.getByRole('radiogroup', { name: 'Billing' });
      const announcement = pricing.getByRole('status');
      const proPrice = pricing.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Pro' }) }).locator('[data-slot="pricing-price"]');
      assert.equal(await billing.getByRole('radio', { name: 'Monthly' }).isChecked(), true, 'monthly is the first choice');
      assert.equal(await proPrice.innerText(), '$49\nper month', 'Pro shows its monthly price');
      assert.equal(await announcement.textContent(), '', 'nothing is announced before a change');
      await billing.getByRole('radio', { name: 'Yearly' }).click();
      assert.equal(await proPrice.innerText(), '$39\nper month, billed yearly', 'Pro shows its yearly price');
      assert.equal(
        await announcement.textContent(),
        'Yearly. Free: $0 forever. Pro: $39 per month, billed yearly. Scale: $960 per month, billed yearly.',
        'the new prices are announced',
      );
      await billing.getByRole('radio', { name: 'Monthly' }).press('Space');
      assert.equal(await proPrice.innerText(), '$49\nper month', 'the keyboard switches back');
      assert.match((await announcement.textContent()) ?? '', /^Monthly\. .*Pro: \$49 per month\./, 'switching back is announced too');
      await close();
    },
  },
  {
    name: 'the feature rows show live Kosmos components, each with a one-sentence caption and a link to its docs',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const section = page.locator('[data-landing-section="features"]');
      assert.equal(await section.locator('h2').count(), 1, 'the features section has a heading');
      const rows = await section.locator('[data-slot="feature-rows-item"]').evaluateAll((items) =>
        items.map((item) => ({
          title: item.querySelector('h3')?.textContent?.trim(),
          href: item.querySelector('[data-slot="feature-rows-item-link"]')?.getAttribute('href'),
          caption: item.querySelector('[data-slot="feature-rows-item-description"]')?.textContent?.trim(),
          components: [...item.querySelectorAll('[data-slot="feature-rows-item-media"] [data-slot]')].map((element) => element.getAttribute('data-slot')),
        })),
      );
      assert.equal(rows.length, 3, `feature rows: ${rows.length}`);
      for (const row of rows) {
        assert.ok(row.title, 'a row has a title');
        assert.match(row.href ?? '', /^\/docs\/(components|blocks)\/[a-z-]+$/, `${row.title}: links to its docs page`);
        assert.ok(row.caption && !row.caption.includes('\n'), `${row.title}: one sentence of caption`);
        assert.ok(row.components.length > 0, `${row.title}: shows a real component`);
        await fetchText(row.href!);
      }
      await close();
    },
  },
  {
    name: 'the showcase switches screens with its tabs, each a live block',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const section = page.locator('[data-landing-section="showcase"]');
      const tabs = section.getByRole('tablist', { name: 'Screens' });
      for (const [name, address] of [['Roadmap', 'acme.example/roadmap'], ['Auth', 'acme.example/login'], ['Settings', 'acme.example/settings'], ['Dashboard', 'acme.example/projects']]) {
        await tabs.getByRole('tab', { name }).click();
        assert.equal(await tabs.getByRole('tab', { name }).getAttribute('aria-selected'), 'true', `${name}: selected`);
        await section.getByText(address, { exact: true }).waitFor();
        await page.waitForFunction(
          (label) => {
            const panels = [...document.querySelectorAll<HTMLElement>('[data-landing-section="showcase"] [data-slot="showcase-panels"] > [role="tabpanel"]')];
            const shown = panels.filter((panel) => getComputedStyle(panel).visibility === 'visible' && Number(getComputedStyle(panel).opacity) === 1);
            return shown.length === 1 && shown[0].getAttribute('aria-label') === label && panels.filter((panel) => panel.hasAttribute('inert')).length === panels.length - 1;
          },
          name,
        );
      }
      const panels = section.locator('[data-slot="showcase-panels"] > [role="tabpanel"]');
      assert.equal(await panels.count(), 4, 'every screen stays mounted, so a switch is a cross-fade');
      assert.match(await panels.first().evaluate((panel) => getComputedStyle(panel).transitionProperty), /opacity/, 'the screens fade');
      await close();
    },
  },
  {
    name: 'the landing fits a 375px phone with no sideways scroll, and the install command never truncates',
    async run(browser) {
      const { page, close } = await openPage(browser, '/', phone);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 0, `the page scrolls ${overflow}px sideways`);
      const cut = await page.locator('[data-landing-section="hero"] [data-slot="hero-install"] input').evaluate((input) => (input as HTMLInputElement).scrollWidth - (input as HTMLInputElement).clientWidth);
      assert.ok(cut <= 1, `the install command is cut by ${cut}px`);
      await page.screenshot({ path: '.screenshots/landing-check-375.png', fullPage: true });
      await close();
    },
  },
  {
    name: "a shared Presets link makes its preset the whole site's, on every page, preview and reload, and the brand colour stays",
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const brandBefore = await cssColor(page, '--brand');
      const radius = (target: ReturnType<Page['locator']>) => target.evaluate((html) => getComputedStyle(html).getPropertyValue('--radius').trim());
      await page.goto(new URL('/presets?preset=soft&accent=off&radius=6', base).href);
      assert.equal(await radius(page.locator('html')), '0.375rem', 'the Presets page takes the shared preset');
      const preview = page.locator('iframe[src="/preset-preview"]').contentFrame();
      await preview.locator('[data-preview-ready]').waitFor({ state: 'attached' });
      assert.equal(await radius(preview.locator('html')), '0.375rem', 'its preview too');
      await page.getByRole('button', { name: 'Preset: Soft' }).waitFor();
      await page.goto(new URL('/docs/blocks/stats-overview', base).href);
      assert.equal(await radius(page.locator('html')), '0.375rem', 'a docs page takes it');
      const exampleFrame = page.locator('iframe[src*="/view/"]').first();
      await exampleFrame.scrollIntoViewIfNeeded();
      const example = exampleFrame.contentFrame();
      await example.locator('[data-preview-root]').waitFor({ state: 'attached' });
      assert.equal(await radius(example.locator('html')), '0.375rem', 'a block preview takes it');
      await page.reload();
      assert.equal(await radius(page.locator('html')), '0.375rem', 'a reload keeps it');
      assert.equal(await cssColor(page, '--brand'), brandBefore, 'the brand colour stays');
      await close();
    },
  },
  {
    name: 'Get code on the Presets page gives the CSS the site applies, its registry item and its DESIGN.md',
    async run(browser) {
      const { page, close } = await openPage(browser, '/presets?preset=console&radius=0');
      const frame = page.locator('iframe[src="/preset-preview"]').contentFrame();
      await frame.locator('[data-preview-ready]').waitFor({ state: 'attached' });
      await page.getByRole('button', { name: 'Get code' }).click();
      const dialog = page.getByRole('dialog', { name: 'Get the Console preset' });
      const code = (tab: string) => dialog.getByRole('tabpanel', { name: tab, exact: true }).locator('pre').first().textContent();
      const choice = { preset: 'console', accent: true, radius: '0' };
      assert.equal((await code('CSS'))?.trim(), presetCss(chosenPreset(choice)).trim(), 'the CSS tab');
      assert.equal(await frame.locator('#site-preset').textContent(), sitePresetCss(choice), 'the CSS the preview applies');
      assert.equal(await page.locator('#site-preset').textContent(), sitePresetCss(choice), 'the CSS the page applies');
      await dialog.getByRole('tab', { name: 'Registry' }).click();
      await dialog.getByRole('tabpanel', { name: 'Registry', exact: true }).locator('pre', { hasText: 'add @kosmos/preset-' }).first().waitFor();
      assert.match((await code('Registry')) ?? '', /add @kosmos\/preset-console-radius-0$/, 'the Registry tab');
      const item = await fetchText('/r/preset-console-radius-0.json');
      assert.equal(JSON.parse(item).cssVars.light.radius, '0rem', 'the registry item');
      await dialog.getByRole('tab', { name: 'DESIGN.md' }).click();
      await dialog.getByRole('tabpanel', { name: 'DESIGN.md', exact: true }).locator('pre', { hasText: '## Palette' }).first().waitFor();
      assert.match((await code('DESIGN.md')) ?? '', /^# Console preset/, 'the DESIGN.md tab');
      await close();
    },
  },
  {
    name: "the Presets page preview's menus, dialogs and toasts take the preset",
    async run(browser) {
      const { page, close } = await openPage(browser, '/presets?preset=warm');
      const frame = page.locator('iframe[src="/preset-preview"]').contentFrame();
      await frame.locator('[data-preview-ready]').waitFor({ state: 'attached' });
      await frame.getByRole('button', { name: 'Show toast' }).click();
      const popover = presetPalette(presets.find((preset) => preset.id === 'warm')!, 'light').popover;
      const fill = (selector: string) =>
        frame.locator(selector).first().evaluate((element, color) => {
          const probe = document.body.appendChild(document.createElement('span'));
          probe.style.color = color;
          const expected = getComputedStyle(probe).color;
          probe.remove();
          return { actual: getComputedStyle(element).backgroundColor, expected };
        }, popover);
      const takesPreset = async (selector: string) => {
        const { actual, expected } = await fill(selector);
        assert.equal(actual, expected, `${selector} takes the Warm popover`);
      };
      await takesPreset('[data-slot="toast"]');
      await page.getByRole('tablist', { name: 'Preview' }).getByRole('tab', { name: 'Dashboard' }).click();
      await frame.getByRole('button', { name: /switch workspace/ }).click();
      await takesPreset('[data-slot="dropdown-menu-content"]');
      await frame.locator('body').press('Escape');
      await frame.getByRole('link', { name: 'Roadmap' }).click();
      await frame.getByRole('button', { name: 'New roadmap item' }).click();
      await takesPreset('[data-slot="dialog-content"]');
      await close();
    },
  },
  {
    name: 'the Presets page fits a 375px phone, its picker opens in a bottom sheet and works with the keyboard',
    async run(browser) {
      const { page, close } = await openPage(browser, '/presets', phone);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 0, `the page scrolls ${overflow}px sideways`);
      await page.locator('main').getByRole('button', { name: 'Preset', exact: true }).click();
      const sheet = page.getByRole('dialog', { name: 'Preset' });
      const presetGroup = sheet.getByRole('radiogroup', { name: 'Preset' });
      await presetGroup.getByRole('radio', { name: 'Default' }).focus();
      await page.keyboard.press('ArrowDown');
      await page.waitForURL((url) => url.search === '?preset=warm');
      assert.equal(await presetGroup.getByRole('radio', { name: 'Warm' }).getAttribute('aria-checked'), 'true', 'the arrow keys pick a preset');
      await page.screenshot({ path: '.screenshots/presets-check-375.png' });
      await page.keyboard.press('Escape');
      await sheet.waitFor({ state: 'hidden' });
      await close();
    },
  },
  {
    name: "the header names the site's preset on every page, and its picker resets it to the Default from the keyboard",
    async run(browser) {
      const { page, close } = await openPage(browser, '/presets?preset=night');
      await page.goto(new URL('/docs', base).href);
      const trigger = page.getByRole('button', { name: 'Preset: Night' });
      await trigger.focus();
      await page.keyboard.press('Enter');
      const reset = page.locator('[data-slot="popover-content"]').getByRole('button', { name: 'Reset' });
      await reset.waitFor();
      await reset.focus();
      await page.keyboard.press('Enter');
      await page.getByRole('button', { name: 'Preset: Default' }).waitFor();
      assert.equal((await page.locator('#site-preset').textContent()) ?? '', '', 'the Default needs no preset CSS');
      await page.keyboard.press('Escape');
      await close();
    },
  },
  {
    name: 'search, Markdown and llms.txt still find the pages of every tab',
    async run() {
      const markdown = await fetchText('/docs/components/button.md');
      assert.match(markdown, /^# Button/, 'button.md');
      assert.match(await fetchText('/docs/foundations/color', { headers: { Accept: 'text/markdown' } }), /^# Color/, 'Accept: text/markdown');
      const llms = await fetchText('/llms.txt');
      for (const path of ['/docs/installation', '/docs/foundations/color', '/docs/components/button', '/docs/blocks/data-table']) {
        assert.ok(llms.includes(`${path}/content.md`) || llms.includes(`${path}.md`), `llms.txt lists ${path}`);
      }
      for (const [query, url] of [
        ['button', '/docs/components/button'],
        ['data table', '/docs/blocks/data-table'],
        ['color', '/docs/foundations/color'],
      ]) {
        const results = JSON.parse(await fetchText(`/api/search?query=${encodeURIComponent(query)}`)) as { url: string }[];
        assert.equal(results[0]?.url.split('#')[0], url, `search "${query}": first result`);
      }
    },
  },
  {
    name: 'no focus ring is cut off by an overflow ancestor on any /view route, on a desktop in light and a phone in dark',
    async run(browser) {
      const names = exampleNames();
      const hits = [...(await sweepRoutes(browser, base, names, 'light', desktop.width)), ...(await sweepRoutes(browser, base, names, 'dark', phone.width))];
      assert.deepEqual(
        hits.map((hit) => `${hit.route} (${hit.phase}): ${hit.element} cut by ${hit.clipper}${hit.sides.length ? `, ${hit.sides.join(', ')}` : ''}`),
        [],
        'clipped focus rings',
      );
    },
  },
  {
    name: 'no docs page scrolls sideways on a 375px phone',
    async run(browser) {
      const wide = (await probeDocsPages(browser)).filter((probe) => probe.overflow > 0);
      assert.deepEqual(
        wide.map((probe) => `${probe.path}: ${probe.overflow}px sideways`),
        [],
        'pages wider than the phone',
      );
    },
  },
  {
    name: 'no docs page logs a console error or warning',
    async run(browser) {
      const noisy = (await probeDocsPages(browser)).filter((probe) => probe.messages.length > 0);
      assert.deepEqual(
        noisy.map((probe) => `${probe.path}: ${[...new Set(probe.messages)].join(' | ')}`),
        [],
        'pages that log to the console',
      );
    },
  },
];

const browser = await chromium.launch().catch((error: Error) => {
  console.error(`could not launch Chromium (run \`pnpm exec playwright install chromium\`): ${error.message}`);
  process.exit(1);
});

let failed = 0;
for (const check of checks.filter((candidate) => !values.only || candidate.name.includes(values.only))) {
  try {
    await check.run(browser);
    console.log(`ok   ${check.name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${check.name}\n     ${(error as Error).message.split('\n').join('\n     ')}`);
  }
}
await browser.close();
if (failed) process.exit(1);
