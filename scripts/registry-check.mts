// Usage: pnpm registry:check <name> [more names] [--keep]
// Seam 2: proves `shadcn add @kosmos/<name>` works in a clean Next.js + shadcn (Base UI) project.
// 1. Runs `pnpm registry:build` and serves public/r on a free localhost port (no dev server needed).
// 2. Copies a cached clean app ($KOSMOS_CHECK_DIR or $TMPDIR/kosmos-registry-check/template, created on first
//    run with `shadcn init -t next -b base -p nova`) into a fresh run folder, so parallel runs never collide.
// 3. Points `@kosmos` at the local registry and installs the documented way: `shadcn add @kosmos/tokens`
//    (a registry:theme, the only kind the CLI lets overwrite the app's existing shadcn colors), then
//    `shadcn add @kosmos/<name> -y -o`. Checks the files and CSS variables landed, renders `<name>-demo`
//    (if it exists, after adding any other `@kosmos` component it imports) on a page, and runs `npm run build`.
// The run folder is deleted on success unless --keep; on failure it is kept and printed.
import { execFileSync, spawn, type SpawnOptions } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import {
  extraImportedItems,
  installedPath,
  readRegistryItems,
  registryNamespace,
  resolveRegistryTree,
  toInstalledImports,
  type RegistryItem,
} from '../lib/registry.ts';
import { presetChoices, presetRegistryItem } from '../lib/presets/index.ts';

const shadcnVersion = '4.21.4';
const repo = process.cwd();
const { positionals: names, values } = parseArgs({
  allowPositionals: true,
  options: { keep: { type: 'boolean', default: false } },
});
if (names.length === 0) {
  console.error('usage: pnpm registry:check <name> [more names] [--keep]');
  process.exit(1);
}

const cacheDir = resolve(process.env.KOSMOS_CHECK_DIR ?? join(tmpdir(), 'kosmos-registry-check'));
const templateDir = join(cacheDir, 'template');
const readyFile = join(templateDir, '.kosmos-ready');

// A child environment without pnpm's variables, so the clean app behaves like a plain npm project.
const cleanEnv = {
  ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(npm_|PNPM_|pnpm_)/i.test(key))),
  CI: '1',
} as unknown as NodeJS.ProcessEnv;
// Async on purpose: the registry server below lives in this process and must keep answering.
function run(cmd: string, args: string[], options: { cwd: string; env?: NodeJS.ProcessEnv }): Promise<void> {
  console.log(`$ ${[cmd, ...args].join(' ')}   (in ${options.cwd})`);
  return new Promise((done, fail) => {
    const spawnOptions: SpawnOptions = { stdio: ['ignore', 'inherit', 'inherit'], env: cleanEnv, ...options };
    const child = spawn(cmd, args, spawnOptions);
    child.on('error', fail);
    child.on('exit', (code) => (code === 0 ? done() : fail(new Error(`${cmd} ${args.join(' ')} exited with ${code}`))));
  });
}
const step = (message: string) => console.log(`\n▸ ${message}`);

async function ensureTemplate() {
  if (existsSync(readyFile)) return;
  mkdirSync(cacheDir, { recursive: true });
  const lock = join(cacheDir, 'template.lock');
  const started = Date.now();
  for (;;) {
    try {
      mkdirSync(lock);
      break;
    } catch {
      if (existsSync(readyFile)) return;
      const stale = Date.now() - statSync(lock).mtimeMs > 10 * 60_000;
      if (stale) rmSync(lock, { recursive: true, force: true });
      if (Date.now() - started > 15 * 60_000) throw new Error(`Timed out waiting for ${lock}`);
      execFileSync('sleep', ['2']);
    }
  }
  try {
    if (existsSync(readyFile)) return;
    step(`Creating the clean app (once) in ${templateDir}`);
    rmSync(templateDir, { recursive: true, force: true });
    await run(
      'npx',
      ['-y', `shadcn@${shadcnVersion}`, 'init', '-t', 'next', '-b', 'base', '-p', 'nova', '-n', 'template', '--no-monorepo', '-y'],
      { cwd: cacheDir },
    );
    writeFileSync(readyFile, `${new Date().toISOString()} shadcn@${shadcnVersion}\n`);
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}

function copyTemplate(): string {
  const target = mkdtempSync(join(cacheDir, 'run-'));
  try {
    execFileSync('cp', ['-cR', `${templateDir}/.`, target]); // APFS clone: instant on macOS
  } catch {
    execFileSync('cp', ['-a', `${templateDir}/.`, target]);
  }
  return target;
}

function serveRegistry(): Promise<{ url: string; close: () => void }> {
  const outDir = join(repo, 'public/r');
  const server = createServer((req, res) => {
    const file = join(outDir, decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname.replace(/^\/r\//, '/')));
    if (!file.startsWith(outDir) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' }).end(readFileSync(file));
  });
  return new Promise((done) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      done({ url: `http://127.0.0.1:${port}/r/{name}.json`, close: () => server.close() });
    });
  });
}

function checkInstall(app: string, tree: RegistryItem[]) {
  const problems: string[] = [];
  const css = readFileSync(join(app, 'app/globals.css'), 'utf8');
  const block = (selector: string) => {
    const start = css.indexOf(`${selector} {`);
    return start === -1 ? '' : css.slice(start, css.indexOf('}', start));
  };
  const norm = (value: string) => value.replace(/\s+/g, ' ').trim();
  for (const item of tree) {
    for (const file of item.files ?? []) {
      if (!existsSync(join(app, installedPath(file)))) problems.push(`${item.name}: ${installedPath(file)} was not written`);
    }
  }
  // The dependencies install first, so where two items set one variable (a preset over the tokens) the item wins.
  const installOrder = [...tree.slice(1), tree[0]];
  for (const [mode, selector] of [
    ['light', ':root'],
    ['dark', '.dark'],
  ] as const) {
    const body = block(selector);
    const expected = new Map(installOrder.flatMap((item) => Object.entries(item.cssVars?.[mode] ?? {}).map(([key, value]) => [key, { item, value }] as const)));
    for (const [key, { item, value }] of expected) {
      const match = new RegExp(`--${key}:\\s*([^;]+);`).exec(body);
      if (!match) problems.push(`${item.name}: --${key} missing from ${selector}`);
      else if (norm(match[1]) !== norm(value)) problems.push(`${item.name}: ${selector} --${key} is "${norm(match[1])}", expected "${norm(value)}"`);
    }
  }
  for (const item of tree) {
    for (const key of Object.keys(item.cssVars?.theme ?? {})) {
      if (!new RegExp(`--${key}:`).test(block('@theme inline'))) problems.push(`${item.name}: --${key} missing from @theme inline`);
    }
  }
  return problems;
}

/**
 * Other `@kosmos/*` components the `<name>-demo` imports that the item itself doesn't pull in (a Popover demo
 * opens from a Button). A user copying the demo from the docs adds them too, so the check does the same.
 */
function demoExtras(name: string, tree: RegistryItem[], items: RegistryItem[]): string[] {
  const demo = join(repo, 'registry/kosmos/examples', `${name}-demo.tsx`);
  if (!existsSync(demo)) return [];
  return extraImportedItems(readFileSync(demo, 'utf8'), tree, items).map((item) => item.name);
}

function writeSmokePage(app: string, name: string, item: RegistryItem) {
  const demo = join(repo, 'registry/kosmos/examples', `${name}-demo.tsx`);
  const dir = join(app, 'app/kosmos-check');
  mkdirSync(dir, { recursive: true });
  const modules = (item.files ?? []).filter((file) => /\.(tsx?|jsx?)$/.test(file.path) && file.type !== 'registry:page');
  const imports = modules
    .map((file, index) => `import * as m${index} from '@/${installedPath(file).replace(/\.(tsx?|jsx?)$/, '')}';`)
    .join('\n');
  const keys = modules.map((_, index) => `...Object.keys(m${index})`).join(', ');
  if (existsSync(demo)) writeFileSync(join(dir, 'demo.tsx'), toInstalledImports(readFileSync(demo, 'utf8')));
  writeFileSync(
    join(dir, 'page.tsx'),
    `${imports}
${existsSync(demo) ? "import Demo from './demo';" : ''}

export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-10">
      ${existsSync(demo) ? '<Demo />' : ''}
      <p>{[${keys}].join(', ')}</p>
    </main>
  );
}
`,
  );
}

step('Building the registry');
await run(process.execPath, ['scripts/registry-build.mts'], { cwd: repo, env: process.env });
// The preset items are written by registry:build from lib/presets, not authored as registry.json files.
const items = [...readRegistryItems(repo), ...presetChoices().map(presetRegistryItem)];
await ensureTemplate();
const registry = await serveRegistry();
let failed = false;
try {
  for (const name of names) {
    const started = Date.now();
    const tree = resolveRegistryTree(name, items);
    const app = copyTemplate();
    try {
      step(`@kosmos/${name} -> ${app}`);
      const componentsJson = JSON.parse(readFileSync(join(app, 'components.json'), 'utf8'));
      componentsJson.registries = { ...componentsJson.registries, [registryNamespace]: registry.url };
      writeFileSync(join(app, 'components.json'), `${JSON.stringify(componentsJson, null, 2)}\n`);
      const shadcn = join(app, 'node_modules/.bin/shadcn');
      if (name !== 'tokens') await run(shadcn, ['add', `${registryNamespace}/tokens`, '-y', '-o'], { cwd: app });
      await run(shadcn, ['add', `${registryNamespace}/${name}`, '-y', '-o'], { cwd: app });
      const problems = checkInstall(app, tree);
      if (problems.length) throw new Error(`install check failed:\n  ${problems.join('\n  ')}`);
      const extras = demoExtras(name, tree, items);
      if (extras.length) {
        await run(shadcn, ['add', ...extras.map((dep) => `${registryNamespace}/${dep}`), '-y', '-o'], { cwd: app });
      }
      writeSmokePage(app, name, tree[0]);
      await run('npm', ['run', 'build'], { cwd: app });
      console.log(`\n✔ @kosmos/${name}: installed (${tree.map((item) => item.name).join(' + ')}) and built in ${Math.round((Date.now() - started) / 1000)}s`);
      if (values.keep) console.log(`  kept: ${app}`);
      else rmSync(app, { recursive: true, force: true });
    } catch (error) {
      failed = true;
      console.error(`\n✘ @kosmos/${name}: ${(error as Error).message}\n  project kept for inspection: ${app}`);
    }
  }
} finally {
  registry.close();
}
if (failed) process.exit(1);
