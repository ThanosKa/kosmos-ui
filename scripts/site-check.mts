// Usage: pnpm site-check [--port 3000 | --base http://localhost:3000] [--check overflow] [--route /view] [--theme dark] [--width 375]
// The browser check. Opens every site page, docs page and review preview of a running server at 375 and 1280 wide (the Presets preview on each
// of its five tabs at 341 and 966, the widths its iframe gets), in light and dark, and prints one line per finding: route, theme, width, check, detail. Checks: overflow (the page scrolls
// sideways at 375), focus-ring (a clipping ancestor or a scroll area's edge fade covers a focus ring), clipped-text (text cut by an ancestor that does not scroll), names (a control with no accessible name) and console (console and page errors).
// --check, --route, --theme and --width each narrow the run and can repeat. --route takes a page or a group of pages
// (/view, /docs/components). Findings listed in site-check-exceptions.mts print as known and do not fail the run.
// Exits 1 on any other finding.
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { checkPage, checks, formatFinding, siteRoutes, splitKnown, widthsFor, type Check, type Finding } from '../lib/site-check.ts';
import { knownExceptions } from './site-check-exceptions.mts';
import { serverBase, serverOptions, type Theme } from './site.mts';

const { values } = parseArgs({
  options: {
    ...serverOptions,
    check: { type: 'string', multiple: true },
    route: { type: 'string', multiple: true },
    theme: { type: 'string', multiple: true },
    width: { type: 'string', multiple: true },
    workers: { type: 'string', default: '4' },
  },
});

const only = (values.check ?? checks) as Check[];
const unknownCheck = only.find((check) => !checks.includes(check));
if (unknownCheck) {
  console.error(`unknown check ${unknownCheck}; the checks are ${checks.join(', ')}`);
  process.exit(1);
}
const themes = (values.theme ?? ['light', 'dark']) as Theme[];
const widths = (values.width ?? ['375', '1280']).map(Number);
const widthsOf = (route: string) => (values.width ? widths : widthsFor(route, widths));
const routes = values.route ? [...new Set(values.route.flatMap((group) => siteRoutes(group)))] : siteRoutes();
if (routes.length === 0) {
  console.error(`no route matches ${values.route?.join(', ')}`);
  process.exit(1);
}

const base = serverBase(values);
const jobs = routes.flatMap((route) => themes.flatMap((theme) => widthsOf(route).map((width) => ({ route, theme, width }))));
const findings: Finding[] = [];
const browser = await chromium.launch();
let next = 0;
await Promise.all(
  Array.from({ length: Number(values.workers) }, async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      findings.push(...(await checkPage(browser, base, job.route, job, only)));
    }
  }),
);
await browser.close();

const order = (finding: Finding) => `${finding.route}|${finding.theme}|${finding.width}|${finding.check}|${finding.detail}`;
const { failing, known } = splitKnown(findings.sort((a, b) => order(a).localeCompare(order(b))), knownExceptions);
for (const finding of failing) console.log(formatFinding(finding));
for (const finding of known) console.log(`known  ${formatFinding(finding)}`);
console.log(`${failing.length} findings, ${known.length} known, ${routes.length} routes, ${jobs.length} page loads`);
process.exit(failing.length ? 1 : 0);
