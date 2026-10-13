// Usage: pnpm docs:check [--port 3000 | --base http://localhost:3000] [--only <text>]
// Checks the docs site from a running dev server in a real browser: each check opens pages and asserts what a
// visitor sees. Prints one line per check; exits 1 when any check fails. --only runs the checks whose name holds <text>.
import assert from 'node:assert/strict';
import { parseArgs } from 'node:util';
import { chromium, type Browser, type Page } from 'playwright';

const { values } = parseArgs({
  options: {
    port: { type: 'string' },
    base: { type: 'string' },
    only: { type: 'string' },
  },
});

const base = values.base ?? `http://localhost:${values.port ?? process.env.PORT ?? 3000}`;
const phone = { width: 375, height: 800 };
const desktop = { width: 1280, height: 800 };

type Viewport = { width: number; height: number };

/** Opens `path` in light mode with reduced motion. Page errors fail the check that opened it when it closes. */
async function openPage(browser: Browser, path: string, viewport: Viewport = desktop) {
  const context = await browser.newContext({ viewport, colorScheme: 'light', reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    localStorage.setItem('theme', 'light');
    // The dev server's indicator would sit in every screenshot, block viewer iframes included.
    document.addEventListener('DOMContentLoaded', () => {
      document.head.append(Object.assign(document.createElement('style'), { textContent: 'nextjs-portal { display: none !important; }' }));
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

/** Asserts the header marks `label` as the current tab, in `active-foreground`. */
async function assertCurrentTab(page: Page, label: string, where: string) {
  const current = page.locator('nav[aria-label="Site"]:visible a[aria-current="page"]');
  assert.equal(await current.count(), 1, `${where}: one current tab`);
  assert.equal((await current.textContent())?.trim(), label, `${where}: current tab`);
  const color = await current.evaluate((link) => getComputedStyle(link).color);
  assert.equal(color, await cssColor(page, '--active-foreground'), `${where}: current tab color`);
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

/** The block viewer of the variant `name` on a block category page. */
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
    name: 'the Blocks sidebar shows only the block sections that have categories, each category with its variant count',
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
        ['Blocks', 'Application'],
        'sidebar sections (Marketing and AI have no categories yet)',
      );
      const application = sections[1].items;
      assert.deepEqual(application.map((item) => item.url).sort(), oldBlockUrls.toSorted(), 'Application lists every block category');
      for (const item of application) {
        assert.equal(item.count, '1', `${item.url}: variant count`);
        assert.match(item.text ?? '', /1 variant(?!s)/, `${item.url}: screen reader count`);
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
      const stageWidth = await viewer.locator('[data-block-viewer-stage]').evaluate((stage) => stage.clientWidth);
      const metricColumns = () =>
        frame
          .contentFrame()
          .locator('[data-preview-content] [role="tablist"]')
          .first()
          .evaluate((list) => getComputedStyle(list).gridTemplateColumns.split(' ').length);
      const widths = viewer.getByRole('radiogroup', { name: 'Preview width' });
      for (const [label, width, columns] of [
        ['Tablet', 768, 2],
        ['Phone', 375, 2],
        ['Desktop', stageWidth, 4],
      ] as const) {
        await widths.getByRole('radio', { name: label }).click();
        await page.waitForFunction(
          ([selector, expected]) => document.querySelector(selector)?.getBoundingClientRect().width === expected,
          ['#stats-overview iframe', width] as const,
        );
        await frame.contentFrame().locator('[data-preview-content]').waitFor();
        await page.waitForFunction(() => document.fonts.ready);
        assert.equal(await metricColumns(), columns, `${label}: metric columns in the block`);
        await viewer.screenshot({ path: `.screenshots/block-viewer-${label.toLowerCase()}.png` });
      }
      assert.ok(stageWidth > 900, `Desktop: the viewer spans the content width (${stageWidth}px)`);
      await close();
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
      assert.equal(await panel.getByRole('link', { name: 'Get Pro' }).getAttribute('href'), '/pro', 'link to Pro');
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
