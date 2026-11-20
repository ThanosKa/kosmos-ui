import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, test } from 'node:test';
import { chromium, type Browser } from 'playwright';
import { checkPage, previewWidths, siteRoutes, splitKnown, type Finding } from './site-check.ts';

const ringStyle = '<style>button:focus-visible{outline:2px solid red;outline-offset:2px}</style>';

const pages: Record<string, string> = {
  '/clean': '<p>Nothing wrong here.</p>',
  '/wide': '<div style="width:600px;height:20px">wide</div>',
  '/clipped': `${ringStyle}<div id="card" style="overflow:hidden;width:fit-content"><button style="margin:0;border:0;padding:4px">Save</button></div>`,
  '/room': `${ringStyle}<div style="overflow:hidden;width:fit-content;padding:8px"><button style="margin:0;border:0;padding:4px">Save</button></div>`,
  '/resting': `<style>button{box-shadow:0 0 0 1px gray}button:focus-visible{outline:2px solid red;outline-offset:-2px}</style><div style="overflow:hidden;width:fit-content"><button style="margin:0;border:0;padding:4px">Save</button></div>`,
  '/shadow-ring': `<style>button:focus-visible{outline:none;box-shadow:0 0 0 2px red}</style><div id="card" style="overflow:hidden;width:fit-content"><button style="margin:0;border:0;padding:4px">Save</button></div>`,
  '/text-cut': '<div id="chip" style="overflow:hidden;width:60px;white-space:nowrap;font:16px/20px sans-serif">A label that runs past the chip</div>',
  '/text-ellipsis': '<div style="overflow:hidden;width:60px;white-space:nowrap;text-overflow:ellipsis;font:16px/20px sans-serif">A label that runs past the chip</div>',
  '/text-clamp': '<div style="overflow:hidden;width:80px;height:20px;font:16px/20px sans-serif;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical">A label that wraps onto a second line</div>',
  '/text-scrolls': '<div style="overflow:auto;width:60px;white-space:nowrap;font:16px/20px sans-serif">A label that runs past the box</div>',
  '/text-hidden-kinds': '<div style="overflow:hidden;width:60px;white-space:nowrap;font:16px/20px sans-serif"><span style="opacity:0">Invisible words past the edge</span><span class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden">Screen reader only words</span><div hidden="until-found">Found in page words</div></div>',
  '/text-fits': '<div style="overflow:hidden;width:200px;font:16px/20px sans-serif">Short</div>',
  '/nameless': '<button></button><a href="/x"></a><input type="text"><div role="checkbox" tabindex="0"></div>',
  '/named': '<button>Save</button><button aria-label="Close"></button><a href="/x">Home</a><label>Email <input type="text"></label>',
  '/fade-under-ring': `${ringStyle}<div data-slot="scroll-area-viewport" style="--scroll-area-overflow-y-start:20px;overflow:auto;height:100px;padding:10px"><button style="margin:0;border:0;padding:4px">Save</button><div style="height:300px"></div></div>`,
  '/fade-inactive': `${ringStyle}<div data-slot="scroll-area-viewport" style="--scroll-area-overflow-y-start:0px;overflow:auto;height:100px;padding:10px"><button style="margin:0;border:0;padding:4px">Save</button><div style="height:300px"></div></div>`,
  '/fade-clear': `${ringStyle}<div data-slot="scroll-area-viewport" style="--scroll-area-overflow-y-start:20px;overflow:auto;height:100px;padding:40px 10px"><button style="margin:0;border:0;padding:4px">Save</button><div style="height:300px"></div></div>`,
  '/broken': '<script>console.error("boom")</script><script>throw new Error("crash")</script>',
};

let server: Server;
let browser: Browser;
let base: string;

before(async () => {
  server = createServer((request, response) => {
    const body = pages[request.url ?? ''];
    response.writeHead(body ? 200 : 404, { 'content-type': 'text/html' }).end(`<!doctype html><meta name="viewport" content="width=device-width"><style>body{margin:0}</style>${body ?? ''}`);
  });
  await new Promise<void>((done) => server.listen(0, done));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  browser = await chromium.launch();
});

after(async () => {
  server?.close();
  await browser?.close();
});

const run = (route: string, width = 375, checks?: Parameters<typeof checkPage>[4]) => checkPage(browser, base, route, { theme: 'light', width }, checks);

describe('browser check on a page', () => {
  test('a page that fits and works has no findings', async () => {
    assert.deepEqual(await run('/clean'), []);
  });

  test('a page wider than the phone reports its overflow in pixels', async () => {
    const [finding] = await run('/wide');
    assert.equal(finding.check, 'overflow');
    assert.equal(finding.route, '/wide');
    assert.equal(finding.width, 375);
    assert.match(finding.detail, /225px/);
  });

  test('overflow is only a finding at 375', async () => {
    assert.deepEqual(await run('/wide', 1280), []);
  });

  test('a focus ring cut by an overflow-hidden ancestor names the element, the clipper and the side', async () => {
    const ring = (await run('/clipped')).filter((finding) => finding.check === 'focus-ring');
    assert.equal(ring.length, 1);
    assert.match(ring[0].detail, /button "Save"/);
    assert.match(ring[0].detail, /div#card/);
    assert.match(ring[0].detail, /left 4px/);
  });

  test('a focus ring with room inside its ancestor is not a finding', async () => {
    assert.deepEqual(await run('/room'), []);
  });

  test('a spread shadow the element wears at rest is not its focus ring', async () => {
    assert.deepEqual(await run('/resting'), []);
  });

  test('a ring shadow that appears on focus and is cut is a finding', async () => {
    const ring = (await run('/shadow-ring')).filter((finding) => finding.check === 'focus-ring');
    assert.equal(ring.length, 1);
    assert.match(ring[0].detail, /left 2px/);
  });

  test('text cut by an overflow-hidden ancestor names the text, the clipper, the side and the pixels', async () => {
    const cut = await run('/text-cut', 375, ['clipped-text']);
    assert.equal(cut.length, 1);
    assert.equal(cut[0].check, 'clipped-text');
    assert.match(cut[0].detail, /A label that runs past the chip/);
    assert.match(cut[0].detail, /div#chip/);
    assert.match(cut[0].detail, /right \d+px/);
  });

  test('text that truncates on purpose, scrolls, fits or is not visible is not clipped text', async () => {
    for (const route of ['/text-ellipsis', '/text-clamp', '/text-scrolls', '/text-hidden-kinds', '/text-fits']) {
      assert.deepEqual(await run(route, 375, ['clipped-text']), [], route);
    }
  });

  test('a control with no accessible name is a finding for each role', async () => {
    const details = (await run('/nameless', 375, ['names'])).map((finding) => finding.detail);
    for (const role of ['button', 'link', 'textbox', 'checkbox']) assert.ok(details.some((detail) => detail.startsWith(role)), role);
  });

  test('controls with a name, a label or an aria-label are not findings', async () => {
    assert.deepEqual(await run('/named', 375, ['names']), []);
  });

  test('a focus ring inside an active scroll area edge fade is a finding', async () => {
    const ring = await run('/fade-under-ring', 375, ['focus-ring']);
    assert.equal(ring.length, 1);
    assert.match(ring[0].detail, /button "Save"/);
    assert.match(ring[0].detail, /fade/);
    assert.match(ring[0].detail, /top/);
  });

  test('a focus ring clear of the fade, or under an inactive fade, is not a finding', async () => {
    assert.deepEqual(await run('/fade-clear', 375, ['focus-ring']), []);
    assert.deepEqual(await run('/fade-inactive', 375, ['focus-ring']), []);
  });

  test('console errors and page errors are findings', async () => {
    const details = (await run('/broken')).filter((finding) => finding.check === 'console').map((finding) => finding.detail);
    assert.equal(details.length, 2);
    assert.ok(details.some((detail) => detail.includes('boom')));
    assert.ok(details.some((detail) => detail.includes('crash')));
  });

  test('one check runs alone', async () => {
    assert.deepEqual(await run('/broken', 375, ['overflow']), []);
  });

  test('a page that does not answer 200 is a finding, not a crash', async () => {
    const [finding] = await run('/missing');
    assert.equal(finding.check, 'load');
  });
});

describe('known exceptions', () => {
  const finding = (over: Partial<Finding>): Finding => ({ route: '/docs/a', theme: 'light', width: 375, check: 'overflow', detail: 'x', ...over });

  test('an exception for a route and check keeps that finding from failing, other findings still fail', () => {
    const { failing, known } = splitKnown(
      [finding({}), finding({ check: 'console' }), finding({ route: '/docs/b' })],
      [{ route: '/docs/a', check: 'overflow', reason: 'a wide table on purpose' }],
    );
    assert.equal(known.length, 1);
    assert.equal(failing.length, 2);
  });

  test('an exception can narrow to a detail', () => {
    const { failing } = splitKnown(
      [finding({ detail: 'button "Save"' }), finding({ detail: 'button "Cancel"' })],
      [{ route: '/docs/a', check: 'overflow', detail: 'Save', reason: 'r' }],
    );
    assert.equal(failing.length, 1);
  });
});

describe('routes', () => {
  const routes = siteRoutes();

  test('lists the site pages, the docs pages and the review previews', () => {
    for (const route of ['/', '/presets', '/docs', '/docs/components/button', '/view/button']) assert.ok(routes.includes(route), route);
  });

  test('one route group can be picked', () => {
    const picked = siteRoutes('/view');
    assert.ok(picked.length > 0 && picked.every((route) => route.startsWith('/view/')));
    assert.deepEqual(siteRoutes('/docs/components/button'), ['/docs/components/button']);
  });

  test('a slash picks the landing page alone, /docs picks every docs page', () => {
    assert.deepEqual(siteRoutes('/'), ['/']);
    const docs = siteRoutes('/docs');
    assert.ok(docs.includes('/docs') && docs.includes('/docs/components/button'));
    assert.ok(docs.every((route) => route === '/docs' || route.startsWith('/docs/')));
  });

  test('the Presets preview is visited once per tab, and /preset-preview picks them all', () => {
    const previews = siteRoutes('/preset-preview');
    assert.deepEqual(previews, ['components', 'dashboard', 'forms', 'overlays', 'tokens'].map((tab) => `/preset-preview (${tab})`));
    assert.deepEqual(siteRoutes('/preset-preview (forms)'), ['/preset-preview (forms)']);
    assert.ok(routes.includes('/preset-preview (tokens)'));
    assert.deepEqual(previewWidths, [341, 966]);
  });
});
