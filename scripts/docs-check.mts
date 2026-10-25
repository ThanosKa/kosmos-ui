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
import { openSitePage, serverBase, serverOptions } from './site.mts';

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

/** Opens `path` in light mode with reduced motion. Page errors fail the check that opened it when it closes. */
async function openPage(browser: Browser, path: string, viewport: Viewport = desktop) {
  const { page, context, errors } = await openSitePage(browser, base, path, { viewport });
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
        if (item.text?.endsWith(' New')) assert.equal(item.count, undefined, `${item.url}: New replaces the count`);
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
      assert.match(
        (await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))) ?? '',
        /^Copy install command: .*add @kosmos\/data-table$/,
        'the install command comes before the tabs',
      );
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
    name: 'the landing is an ordered list of sections, each labelled with the blocks it is built from',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const sections = await page.locator('[data-landing-section]').evaluateAll((elements) =>
        elements.map((section) => ({
          id: section.getAttribute('data-landing-section'),
          links: [...section.querySelectorAll('[data-block-label] a[href]')].map((link) => new URL((link as HTMLAnchorElement).href).pathname),
        })),
      );
      assert.deepEqual(
        sections.slice(0, 4).map((section) => section.id),
        ['hero', 'dashboard', 'bento', 'inventory'],
        'the landing opens with the hero, the dashboard, the bento and the inventory',
      );
      assert.deepEqual(sections.slice(-3).map((section) => section.id), ['install', 'proof', 'footer'], 'the landing ends with install, proof and the footer');
      for (const section of sections) {
        assert.ok(section.links.length > 0, `${section.id}: names its blocks`);
        for (const url of section.links) {
          assert.match(url, /^\/docs\/(blocks|components)\/[a-z-]+$/, `${section.id}: label links to a block category or component page`);
        }
      }
      assert.deepEqual(sections.at(-1)?.links, ['/docs/blocks/footer'], 'footer: labelled with the Footer block');
      assert.deepEqual(sections[0].links, ['/docs/blocks/hero'], 'hero: labelled with the Hero block');
      assert.equal(sections[1].links.length, 8, 'dashboard: labelled with the 8 application blocks');
      for (const url of new Set(sections.flatMap((section) => section.links))) await fetchText(url);
      assert.equal(await page.locator('[role="dialog"]:visible, [role="alertdialog"]:visible').count(), 0, 'nothing pops up on load');
      await close();
    },
  },
  {
    name: 'the hero shows the title, one line, Browse components and GitHub, and the install command',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const hero = page.locator('[data-landing-section="hero"]');
      assert.equal(await hero.locator('h1').count(), 1, 'one h1');
      assert.equal(await hero.locator('h1 + p, [data-slot="hero-description"]').count() > 0, true, 'one line under the title');
      assert.equal(await hero.getByRole('link', { name: 'Browse components' }).getAttribute('href'), '/docs/components', 'Browse components');
      assert.match((await hero.getByRole('link', { name: 'GitHub' }).getAttribute('href')) ?? '', /^https:\/\/github\.com\//, 'GitHub');
      const copy = hero.getByRole('button', { name: /^Copy install command: .*shadcn@latest/ });
      assert.equal(await copy.count(), 1, 'install command with a copy button');
      const variants = await openPage(browser, '/docs/blocks/hero');
      const variant = variants.page.locator('[data-block-variant]');
      assert.equal(await variant.count(), 1, 'the Hero category page shows one variant');
      assert.equal(await variant.getAttribute('id'), 'hero', 'the free Hero variant');
      assert.equal(await variant.getAttribute('data-tier'), 'free', 'Hero is free');
      await variants.close();
      await close();
    },
  },
  {
    name: 'the install section shows the shadcn command, the files it adds, and links to llms.txt and Markdown pages',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const section = page.locator('[data-landing-section="install"]');
      assert.equal(await section.getByRole('heading', { level: 2 }).count(), 1, 'one h2');
      const copy = section.getByRole('button', { name: /^Copy install command: npx shadcn@latest add @kosmos\// });
      assert.equal(await copy.count(), 1, 'the npm command with a copy button');
      const command = (await copy.getAttribute('aria-label'))!.replace('Copy install command: ', '');
      const name = command.split('@kosmos/')[1];
      const files = await section.locator('[data-terminal-file]').allTextContents();
      const item = JSON.parse(await fetchText(`/r/${name}.json`)) as { files: { path: string }[] };
      assert.ok(files.length > item.files.length, `the transcript lists the block's files and its components (${files.length})`);
      assert.ok(files.includes(`components/${name}.tsx`), `the transcript lists components/${name}.tsx`);
      await section.getByRole('tab', { name: 'pnpm' }).click();
      assert.equal(await section.getByRole('button', { name: /^Copy install command: pnpm dlx shadcn@latest add/ }).count(), 1, 'pnpm switches the command');
      const paths = await section.locator('a[href]').evaluateAll((links) => links.map((link) => new URL((link as HTMLAnchorElement).href).pathname));
      for (const path of ['/llms.txt', '/llms-full.txt']) assert.ok(paths.includes(path), `links to ${path}`);
      const markdown = paths.find((path) => path.endsWith('.md'));
      assert.ok(markdown, 'links to a docs page as Markdown');
      for (const path of ['/llms.txt', '/llms-full.txt', markdown]) await fetchText(path);
      await close();
    },
  },
  {
    name: 'the proof shows the GitHub stars or no number at all, and a real date of the last update',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const section = page.locator('[data-landing-section="proof"]');
      assert.equal(await section.getByRole('heading', { level: 2 }).count(), 1, 'one h2');
      const stars = section.locator('[data-stars]');
      if ((await stars.count()) > 0) assert.match((await stars.textContent()) ?? '', /^\d+(\.\d)?[KM]?$/, 'stars as a number');
      assert.match((await section.getByRole('link', { name: /GitHub/ }).first().getAttribute('href')) ?? '', /^https:\/\/github\.com\//, 'links to GitHub');
      const date = await section.locator('time[datetime]').first().getAttribute('datetime');
      assert.match(date ?? '', /^\d{4}-\d{2}-\d{2}/, 'last update as a <time>');
      assert.ok(new Date(date!).getTime() <= Date.now(), 'the last update is not in the future');
      await close();
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
    name: 'the bento shows real Kosmos components, each with a one-line caption and a link to its docs',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const section = page.locator('[data-landing-section="bento"]');
      assert.equal(await section.locator('h2').count(), 1, 'the bento has a heading');
      const tiles = await section.locator('[data-slot="bento-item"]').evaluateAll((items) =>
        items.map((item) => ({
          title: item.querySelector('h3')?.textContent?.trim(),
          href: item.querySelector('h3 a[href]')?.getAttribute('href'),
          caption: item.querySelector('[data-slot="bento-item-description"]')?.textContent?.trim(),
          components: [...item.querySelectorAll('[data-slot="bento-item-visual"] [data-slot]')].map((element) => element.getAttribute('data-slot')),
        })),
      );
      assert.ok(tiles.length >= 4, `bento tiles: ${tiles.length}`);
      for (const tile of tiles) {
        assert.ok(tile.title, 'a tile has a title');
        assert.match(tile.href ?? '', /^\/docs\/components\/[a-z-]+$/, `${tile.title}: links to its component page`);
        assert.ok(tile.caption && !tile.caption.includes('\n'), `${tile.title}: one line of caption`);
        assert.ok(tile.components.length > 0, `${tile.title}: shows a real component`);
        await fetchText(tile.href!);
      }
      const labels = await section.locator('[data-block-label] a[href]').evaluateAll((links) => links.map((link) => new URL((link as HTMLAnchorElement).href).pathname));
      assert.deepEqual(labels, ['/docs/blocks/bento'], 'bento: labelled with the Bento block');
      const variants = await openPage(browser, '/docs/blocks/bento');
      const variant = variants.page.locator('[data-block-variant]');
      assert.equal(await variant.count(), 1, 'the Bento category page shows one variant');
      assert.equal(await variant.getAttribute('id'), 'bento', 'the free Bento variant');
      assert.equal(await variant.getAttribute('data-tier'), 'free', 'Bento is free');
      await variants.close();
      await close();
    },
  },
  {
    name: 'the inventory counts components, block categories and variants from the registry',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const section = page.locator('[data-landing-section="inventory"]');
      const counts = Object.fromEntries(
        await section.locator('[data-slot="bento-item"]').evaluateAll((items) =>
          items.map((item) => [item.querySelector('h3')?.textContent?.trim(), item.querySelector('[data-slot="bento-item-visual"]')?.textContent?.trim()]),
        ),
      );
      assert.deepEqual(
        counts,
        {
          Components: String(authoredItems.filter((item) => item.type === 'registry:ui').length),
          'Block categories': String(new Set(authoredBlocks.map(categoryUrl)).size),
          Variants: String(authoredBlocks.length + proVariants.length),
        },
        'inventory counts',
      );
      const labels = await section.locator('[data-block-label] a[href]').evaluateAll((links) => links.map((link) => new URL((link as HTMLAnchorElement).href).pathname));
      assert.deepEqual(labels, ['/docs/blocks/bento'], 'inventory: labelled with the Bento block');
      await close();
    },
  },
  {
    name: 'the dashboard switches whole screens with its tabs',
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const section = page.locator('[data-landing-section="dashboard"]');
      const frame = section.locator('iframe').contentFrame();
      const screens = section.getByRole('tablist', { name: 'Dashboard screens' });
      for (const name of ['Projects', 'Roadmap', 'Overview']) {
        await screens.getByRole('tab', { name }).click();
        await frame.getByRole('heading', { name, exact: true, level: 1 }).waitFor();
        assert.equal(await screens.getByRole('tab', { name }).getAttribute('aria-selected'), 'true', `${name}: selected`);
      }
      await frame.getByRole('link', { name: 'Roadmap' }).click();
      await page.waitForFunction(() => document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() === 'Roadmap');
      await close();
    },
  },
  {
    name: "the landing's preset picker changes the whole site, the dashboard follows, and Reset brings the Default back",
    async run(browser) {
      const { page, close } = await openPage(browser, '/');
      const section = page.locator('[data-landing-section="dashboard"]');
      const iframe = section.locator('iframe');
      await iframe.contentFrame().locator('[data-preview-ready]').waitFor({ state: 'attached' });
      const look = (target: 'page' | 'dashboard') =>
        (target === 'page' ? page.locator('html') : iframe.contentFrame().locator('html')).evaluate((html) => {
          const style = getComputedStyle(html);
          return { ring: style.getPropertyValue('--ring').trim(), radius: style.getPropertyValue('--radius').trim(), dark: html.classList.contains('dark') };
        });
      const pageBefore = await look('page');
      const brandBefore = await cssColor(page, '--brand');
      assert.deepEqual(await look('dashboard'), pageBefore, 'the dashboard starts in the page look');
      await section.getByRole('radiogroup', { name: 'Preset' }).getByRole('radio', { name: 'Soft' }).click();
      await section.getByRole('radiogroup', { name: 'Radius' }).getByRole('radio', { name: '0px', exact: true }).click();
      await section.getByRole('radiogroup', { name: 'Theme' }).getByRole('radio', { name: 'Dark' }).click();
      await page.waitForFunction(() => {
        const frame = document.querySelector<HTMLIFrameElement>('[data-landing-section="dashboard"] iframe')?.contentDocument;
        return frame?.documentElement.classList.contains('dark') && getComputedStyle(frame.documentElement).getPropertyValue('--radius').trim() === '0rem';
      });
      const changed = await look('page');
      const soft = chosenPreset({ preset: 'soft', accent: true, radius: '0' });
      assert.deepEqual(changed, { ring: presetPalette(soft, 'dark').ring, radius: '0rem', dark: true }, 'the page takes the preset');
      assert.deepEqual(await look('dashboard'), changed, 'the dashboard follows the page');
      assert.equal(await cssColor(page, '--brand'), brandBefore, 'the brand colour stays');
      await section.getByRole('button', { name: 'Reset' }).click();
      await page.waitForFunction((radius) => getComputedStyle(document.documentElement).getPropertyValue('--radius').trim() === radius, pageBefore.radius);
      assert.equal((await look('page')).radius, pageBefore.radius, 'Reset brings the Default back');
      await close();
    },
  },
  {
    name: 'the landing fits a 375px phone with no sideways scroll, and the dashboard values never truncate',
    async run(browser) {
      const { page, close } = await openPage(browser, '/', phone);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 0, `the page scrolls ${overflow}px sideways`);
      const frame = page.locator('[data-landing-section="dashboard"] iframe').contentFrame();
      await frame.locator('[data-preview-ready]').waitFor({ state: 'attached' });
      const frameOverflow = await frame.locator('html').evaluate((html) => html.scrollWidth - html.clientWidth);
      assert.ok(frameOverflow <= 0, `the dashboard scrolls ${frameOverflow}px sideways`);
      const cut = await frame.locator('[data-slot="stats-overview"] [role="tab"] .truncate').evaluateAll((spans) =>
        spans.filter((span) => span.scrollWidth > span.clientWidth + 1).map((span) => span.textContent),
      );
      assert.deepEqual(cut, [], 'truncated metric text');
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
      const code = () => dialog.locator('[role="tabpanel"]:visible pre').first().textContent();
      const choice = { preset: 'console', accent: true, radius: '0' };
      assert.equal((await code())?.trim(), presetCss(chosenPreset(choice)).trim(), 'the CSS tab');
      assert.equal(await frame.locator('#site-preset').textContent(), sitePresetCss(choice), 'the CSS the preview applies');
      assert.equal(await page.locator('#site-preset').textContent(), sitePresetCss(choice), 'the CSS the page applies');
      await dialog.getByRole('tab', { name: 'Registry' }).click();
      await dialog.locator('[role="tabpanel"]:visible pre', { hasText: 'add @kosmos/preset-' }).first().waitFor();
      assert.match((await code()) ?? '', /add @kosmos\/preset-console-radius-0$/, 'the Registry tab');
      const item = await fetchText('/r/preset-console-radius-0.json');
      assert.equal(JSON.parse(item).cssVars.light.radius, '0rem', 'the registry item');
      await dialog.getByRole('tab', { name: 'DESIGN.md' }).click();
      await dialog.locator('[role="tabpanel"]:visible pre', { hasText: '## Palette' }).first().waitFor();
      assert.match((await code()) ?? '', /^# Console preset/, 'the DESIGN.md tab');
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
