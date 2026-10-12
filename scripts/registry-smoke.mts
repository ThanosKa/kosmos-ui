// Usage: pnpm registry:smoke [--port 3103] [--preset nova]
// Seam 3: proves what a user gets who follows content/docs/installation.mdx and installs everything.
// 1. Runs `pnpm registry:build` and serves public/r on localhost (port 3103 by default, 0 picks a free one).
// 2. Reads every built item and checks its imports against its own `dependencies` and `registryDependencies`
//    (installing everything into one app would hide a missing one, since another item brings it in).
// 3. In a new temp folder outside the repo (kept and printed), runs the documented steps with the documented
//    runner (`npx shadcn@latest`): `init -t next -b base` (`-p nova`, the preset the prompt preselects, or --preset),
//    `registry add @kosmos=<local url>`, `add @kosmos/tokens`, then `add` for every other item in one batch
//    (one by one if the batch fails, to name the item that breaks it). Checks the files, packages and tokens landed.
// 4. Writes /kosmos-smoke (every item's docs preview, else `<name>-demo`, on one page) plus /kosmos-smoke/<name> per item, imports
//    every installed module, then runs the app's `npm run typecheck` and `npm run build`.
// 5. In a second clean app, adds shadcn's Dialog, Alert Dialog and Pagination, swaps shadcn's Button for ours with
//    `add @kosmos/button -o`, and type checks and builds a page that uses them and shadcn's Button names (the aliases).
// 6. Prints a pass/fail line per item and for the swap: install, dependencies, types, build. Exits 1 if any fails.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  installedPath,
  packageRunners,
  readRegistryItems,
  registryNamespace,
  resolveRegistryTree,
  toInstalledImports,
  type RegistryItem,
} from '../lib/registry.ts';

const repo = process.cwd();
const { values } = parseArgs({
  options: { port: { type: 'string', default: '3103' }, preset: { type: 'string', default: 'nova' } },
});
const [runner, ...runnerArgs] = packageRunners.npm.split(' '); // the docs' npm tab: `npx shadcn@latest`
const work = mkdtempSync(join(tmpdir(), 'kosmos-smoke-'));
const app = join(work, 'app');
const logs = join(work, 'logs');
mkdirSync(logs);

// A child environment without pnpm's variables, so the new app behaves like a plain npm project.
const cleanEnv = {
  ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(npm_|PNPM_|pnpm_)/i.test(key))),
  CI: '1',
} as unknown as NodeJS.ProcessEnv;

type Result = { ok: boolean; output: string };
let logCount = 0;
/** Runs a command quietly, keeps its output in logs/ and returns it. Async: the registry server must keep answering. */
function run(cmd: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = cleanEnv): Promise<Result> {
  const log = join(logs, `${String(++logCount).padStart(2, '0')}-${[cmd, ...args].join(' ').replace(/[^a-z0-9@.-]+/gi, '_').slice(0, 60)}.log`);
  console.log(`  $ ${[cmd, ...args].join(' ')}`);
  return new Promise((done) => {
    const child = spawn(cmd, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    let finished = false;
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    const finish = (ok: boolean) => {
      if (finished) return;
      finished = true;
      writeFileSync(log, `$ ${[cmd, ...args].join(' ')}\n# in ${cwd}\n\n${output}`);
      if (!ok) console.log(`    failed, see ${log}\n${indent(tail(output, 25), 6)}`);
      done({ ok, output });
    };
    child.on('error', (error) => {
      output += String(error);
      finish(false);
    });
    child.on('exit', (code) => finish(code === 0));
  });
}
const shadcn = (args: string[]) => run(runner, ['-y', ...runnerArgs, ...args], app);
const step = (message: string) => console.log(`\n▸ ${message}`);
const plain = (text: string) => text.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '');
const tail = (text: string, lines: number) => plain(text).trim().split('\n').slice(-lines).join('\n');
const indent = (text: string, spaces: number) => text.replace(/^/gm, ' '.repeat(spaces));

function serveRegistry(port: number): Promise<{ url: string; close: () => void }> {
  const outDir = join(repo, 'public/r');
  const server = createServer((req, res) => {
    const file = join(outDir, decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname.replace(/^\/r\//, '/')));
    if (!file.startsWith(outDir) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' }).end(readFileSync(file));
  });
  return new Promise((done, fail) => {
    server.once('error', (error) => fail(new Error(`Cannot serve the registry on port ${port} (${error.message}). Pass --port <n>, or --port 0 for a free one.`)));
    server.listen(port, '127.0.0.1', () => {
      const { port: bound } = server.address() as AddressInfo;
      done({ url: `http://127.0.0.1:${bound}/r/{name}.json`, close: () => server.close() });
    });
  });
}

// ── per-item findings ────────────────────────────────────────────────────────────────────────────
type Check = 'install' | 'deps' | 'types' | 'build';
const checks: Check[] = ['install', 'deps', 'types', 'build'];
const findings = new Map<string, Record<Check, string[]>>();
const skipped = new Map<string, Set<Check>>();
function fail(name: string, check: Check, message: string) {
  if (!findings.has(name)) findings.set(name, { install: [], deps: [], types: [], build: [] });
  const list = findings.get(name)![check];
  if (!list.includes(message)) list.push(message);
}
function skip(name: string, check: Check) {
  if (!skipped.has(name)) skipped.set(name, new Set());
  skipped.get(name)!.add(check);
}

/** Bare package name of an import specifier (`@base-ui/react/button` -> `@base-ui/react`). */
function packageName(specifier: string) {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}
const stripVersion = (dep: string) => dep.replace(/(?<=.)@[^/]*$/, '');
const providedByApp = new Set(['react', 'react-dom', 'next']);
const importPattern = /(?:^|[\s;])(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\sfrom\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Checks every built file's imports against the item's own `dependencies` and `@kosmos` registry tree. */
function auditDependencies(all: RegistryItem[]) {
  const byPath = new Map<string, string>(); // repo path without extension -> item name
  for (const item of all) for (const file of item.files ?? []) byPath.set(file.path.replace(/\.(tsx?|jsx?)$/, ''), item.name);
  for (const item of all) {
    const built = JSON.parse(readFileSync(join(repo, 'public/r', `${item.name}.json`), 'utf8')) as RegistryItem & {
      files?: { path: string; content?: string }[];
    };
    const declared = new Set([...(item.dependencies ?? []), ...(item.devDependencies ?? [])].map(stripVersion));
    const tree = new Set(resolveRegistryTree(item.name, all).map((dep) => dep.name));
    for (const file of built.files ?? []) {
      for (const match of (file.content ?? '').matchAll(importPattern)) {
        const specifier = match[1] ?? match[2];
        if (specifier.startsWith('.')) {
          fail(item.name, 'deps', `${file.path} imports "${specifier}", a relative path the CLI does not rewrite`);
        } else if (specifier.startsWith('@/')) {
          const target = byPath.get(specifier.slice(2));
          if (!target) fail(item.name, 'deps', `${file.path} imports "${specifier}", which no registry item installs`);
          else if (!tree.has(target)) fail(item.name, 'deps', `imports ${specifier} but ${registryNamespace}/${target} is not in its registryDependencies`);
        } else {
          const pkg = packageName(specifier);
          if (!providedByApp.has(pkg) && !declared.has(pkg)) fail(item.name, 'deps', `imports "${specifier}" but "${pkg}" is not in its dependencies`);
        }
      }
    }
  }
}

/** Files, npm packages and (for the theme) CSS variables each item should have put into the app. */
function checkInstalled(all: RegistryItem[]) {
  const pkg = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));
  const installed = { ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>;
  const css = readFileSync(join(app, 'app/globals.css'), 'utf8');
  const block = (selector: string) => {
    const start = css.indexOf(`${selector} {`);
    return start === -1 ? '' : css.slice(start, css.indexOf('}', start));
  };
  const norm = (value: string) => value.replace(/\s+/g, ' ').trim();
  for (const item of all) {
    for (const file of item.files ?? []) {
      if (!existsSync(join(app, installedPath(file)))) fail(item.name, 'install', `${installedPath(file)} was not written`);
    }
    for (const dep of [...(item.dependencies ?? []), ...(item.devDependencies ?? [])].map(stripVersion)) {
      if (!installed[dep]) fail(item.name, 'install', `package "${dep}" is not in the app's package.json`);
      else if (!existsSync(join(app, 'node_modules', dep, 'package.json'))) fail(item.name, 'install', `package "${dep}" is not in node_modules`);
    }
    for (const [mode, selector] of [
      ['light', ':root'],
      ['dark', '.dark'],
    ] as const) {
      const body = block(selector);
      for (const [key, value] of Object.entries(item.cssVars?.[mode] ?? {})) {
        const match = new RegExp(`--${key}:\\s*([^;]+);`).exec(body);
        if (!match) fail(item.name, 'install', `--${key} missing from ${selector}`);
        else if (norm(match[1]) !== norm(value)) fail(item.name, 'install', `${selector} --${key} is "${norm(match[1])}", expected "${norm(value)}"`);
      }
    }
    for (const key of Object.keys(item.cssVars?.theme ?? {})) {
      if (!new RegExp(`--${key}:`).test(block('@theme inline'))) fail(item.name, 'install', `--${key} missing from @theme inline`);
    }
  }
}

const isModule = (file: { path: string; type: string }) => /\.(tsx?|jsx?)$/.test(file.path) && file.type !== 'registry:page';
const importPath = (file: { path: string; type: string; target?: string }) => `@/${installedPath(file).replace(/\.(tsx?|jsx?)$/, '')}`;
const pascal = (name: string) => name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());

/** The example the item's docs page previews first (`<ComponentPreview name="..." />`), else `<name>-demo`. */
function docsPreview(name: string) {
  for (const section of ['components', 'blocks']) {
    const mdx = join(repo, 'content/docs', section, `${name}.mdx`);
    const preview = existsSync(mdx) && /<ComponentPreview\s+name="([^"]+)"/.exec(readFileSync(mdx, 'utf8'))?.[1];
    if (preview) return preview;
  }
  return `${name}-demo`;
}

/** /kosmos-smoke renders every item's demo; /kosmos-smoke/<name> renders one, so a build error names its item. */
function writePages(all: RegistryItem[]) {
  const root = join(app, 'app/kosmos-smoke');
  const demos = join(root, '_demos');
  rmSync(root, { recursive: true, force: true });
  mkdirSync(demos, { recursive: true });
  const withDemo: string[] = [];
  for (const item of all) {
    const demo = join(repo, 'registry/kosmos/examples', `${docsPreview(item.name)}.tsx`);
    if (!existsSync(demo)) continue;
    writeFileSync(join(demos, `${item.name}.tsx`), toInstalledImports(readFileSync(demo, 'utf8')));
    withDemo.push(item.name);
  }
  const page = (subset: RegistryItem[]) => {
    const modules = subset.flatMap((item) => (item.files ?? []).filter(isModule).map((file) => ({ item: item.name, path: importPath(file) })));
    const demoNames = subset.map((item) => item.name).filter((name) => withDemo.includes(name));
    return `${modules.map((m, index) => `import * as m${index} from '${m.path}';`).join('\n')}
${demoNames.map((name) => `import ${pascal(name)}Demo from '@/app/kosmos-smoke/_demos/${name}';`).join('\n')}

const exported: Record<string, string[]> = {
${modules.map((m, index) => `  '${m.path}': Object.keys(m${index}),`).join('\n')}
};

export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col gap-10 p-10">
${demoNames
  .map(
    (name) => `      <section data-item="${name}" className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">${name}</h2>
        <${pascal(name)}Demo />
      </section>`,
  )
  .join('\n')}
      <pre className="text-xs">{JSON.stringify(exported, null, 2)}</pre>
    </main>
  );
}
`;
  };
  writeFileSync(join(root, 'page.tsx'), page(all));
  // The installation page's own code samples, so the type check covers what the docs tell users to write.
  const docs = readFileSync(join(repo, 'content/docs/installation.mdx'), 'utf8');
  [...docs.matchAll(/```tsx\n([\s\S]*?)```/g)].forEach((match, index) => writeFileSync(join(demos, `installation-${index + 1}.tsx`), match[1]));
  for (const item of all) {
    mkdirSync(join(root, item.name), { recursive: true });
    writeFileSync(join(root, item.name, 'page.tsx'), page([item]));
  }
  return withDemo;
}

/** The item a file in the app belongs to, from its installed path or its smoke page. */
function itemForFile(file: string, all: RegistryItem[]): string | undefined {
  const normalized = file.replace(/^\.\//, '').replace(/^\//, '').replace(`${app}/`, '');
  const page = /^app\/kosmos-smoke\/(?:_demos\/([a-z0-9-]+)\.tsx|([a-z0-9-]+)\/page\.tsx)/.exec(normalized);
  if (page) return page[1]?.startsWith('installation-') ? '(docs)' : (page[1] ?? page[2]);
  return all.find((item) => (item.files ?? []).some((f) => installedPath(f) === normalized))?.name;
}

/** The items a failed `next build` names: by a file path in its output, or by the /kosmos-smoke/<name> page that failed. */
function buildFailures(out: string, all: RegistryItem[]): Map<string, string> {
  const named = new Map<string, string>();
  const firstLine = (index: number) => out.slice(index).split('\n').slice(0, 2).join(' ').replace(/\s+/g, ' ').trim().slice(0, 200);
  for (const match of out.matchAll(/prerendering page "\/kosmos-smoke\/([a-z0-9-]+)"[^\n]*\n([^\n]*)/g)) {
    named.set(match[1], `prerender: ${match[2].trim().slice(0, 200)}`);
  }
  const reason = /(?:Error occurred prerendering[^\n]*\n\s*)?(Error: [^\n]+|Module not found[^\n]*|Type error[^\n]*)/.exec(out)?.[1]?.trim();
  for (const match of out.matchAll(/(?:^|[\s(])(\.?\/?(?:components|lib|hooks|app)\/[\w./-]+\.(?:tsx?|jsx?))(?::\d+)?/gm)) {
    const name = itemForFile(match[1], all);
    if (name && !named.has(name)) named.set(name, reason ? `${reason.slice(0, 160)} (${match[1].replace(/^\.?\//, '')})` : firstLine(match.index));
  }
  return named;
}

// ── shadcn's components on the Kosmos Button ─────────────────────────────────────────────────────
const swapCase = '(shadcn swap)';
const swapPage = `import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function Page() {
  return (
    <main className="flex flex-col items-start gap-6 p-10">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>Edit profile</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Change your name and email.</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="destructive" />}>Delete project</AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="xs">Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="flex items-center gap-2">
        <Button variant="link" size="default">Forgot password?</Button>
        <Button variant="default" size="xs">Small</Button>
        <Button variant="ghost" size="icon-xs" aria-label="Close">×</Button>
        <a href="/" className={buttonVariants({ variant: 'outline', size: 'default' })}>Home</a>
      </div>
    </main>
  );
}
`;

/**
 * A clean shadcn app with shadcn's Dialog, Alert Dialog and Pagination swaps shadcn's Button for ours (`add -o`, as the
 * installation page says) and still type checks and builds, because the Button takes shadcn's names as aliases.
 */
async function checkShadcnSwap() {
  step('Swapping shadcn\'s Button for ours in a clean app with shadcn\'s Dialog, Alert Dialog and Pagination');
  skip(swapCase, 'deps');
  const swap = join(work, 'swap');
  const init = await run(runner, ['-y', ...runnerArgs, 'init', '-t', 'next', '-b', 'base', '-p', values.preset, '-n', 'swap', '--no-monorepo', '-y'], work);
  if (!init.ok) return fail(swapCase, 'install', 'shadcn init exited with an error');
  const inSwap = (args: string[]) => run(runner, ['-y', ...runnerArgs, ...args], swap);
  if (!(await inSwap(['add', 'dialog', 'alert-dialog', 'pagination', '-y'])).ok) return fail(swapCase, 'install', 'shadcn add dialog alert-dialog pagination exited with an error');
  await inSwap(['registry', 'add', `${registryNamespace}=${registry.url}`]);
  if (!(await inSwap(['add', `${registryNamespace}/button`, '-y', '-o'])).ok) return fail(swapCase, 'install', `shadcn add ${registryNamespace}/button -o exited with an error`);
  if (!readFileSync(join(swap, 'components/ui/button.tsx'), 'utf8').includes('data-variant')) fail(swapCase, 'install', 'components/ui/button.tsx is still shadcn\'s Button');

  mkdirSync(join(swap, 'app/swap'), { recursive: true });
  writeFileSync(join(swap, 'app/swap/page.tsx'), swapPage);
  const types = await run('npm', ['run', 'typecheck'], swap);
  for (const match of plain(types.output).matchAll(/^(\S+?)\((\d+),\d+\): error (TS\d+: .+)$/gm)) fail(swapCase, 'types', `${match[1].replace(/^\.\//, '')}:${match[2]} ${match[3]}`);
  if (!types.ok && !findings.get(swapCase)?.types.length) fail(swapCase, 'types', tail(types.output, 1));
  const next = await run('npm', ['run', 'build'], swap);
  if (!next.ok) return fail(swapCase, 'build', tail(next.output, 3).replace(/\n/g, ' '));
  const html = readFileSync(join(swap, '.next/server/app/swap.html'), 'utf8');
  if (/data-variant="outline"|data-size="default"/.test(html) || !html.includes('data-variant="secondary"')) {
    fail(swapCase, 'build', '/swap does not render shadcn\'s names as their Kosmos variants');
  }
}

// ── run ──────────────────────────────────────────────────────────────────────────────────────────
const started = Date.now();
step('Building the registry');
const build = await run(process.execPath, ['scripts/registry-build.mts'], repo, process.env);
if (!build.ok) process.exit(1);
const all = readRegistryItems(repo);
const theme = all.filter((item) => item.type === 'registry:theme');
const rest = all.filter((item) => item.type !== 'registry:theme');
const registry = await serveRegistry(Number(values.port));
console.log(`  serving public/r at ${registry.url}`);

try {
  step('Checking each item\'s imports against its dependencies');
  auditDependencies(all);

  step(`Creating a new Next.js app the documented way in ${app}`);
  const init = await run(runner, ['-y', ...runnerArgs, 'init', '-t', 'next', '-b', 'base', '-p', values.preset, '-n', 'app', '--no-monorepo', '-y'], work);
  if (!init.ok || !existsSync(join(app, 'components.json'))) throw new Error('shadcn init failed, nothing else can run');
  const version = (await run(runner, ['-y', ...runnerArgs, '--version'], app)).output.trim().split('\n').pop();
  console.log(`  shadcn ${version}`);

  step('Adding the @kosmos registry');
  const added = await shadcn(['registry', 'add', `${registryNamespace}=${registry.url}`]);
  const registries = JSON.parse(readFileSync(join(app, 'components.json'), 'utf8')).registries ?? {};
  if (!added.ok || registries[registryNamespace] !== registry.url) throw new Error(`shadcn registry add did not write ${registryNamespace} into components.json`);

  step(`Installing ${theme.map((item) => `${registryNamespace}/${item.name}`).join(' ')} on its own`);
  for (const item of theme) if (!(await shadcn(['add', `${registryNamespace}/${item.name}`, '-y', '-o'])).ok) fail(item.name, 'install', 'shadcn add exited with an error');

  step(`Installing the other ${rest.length} items in one batch`);
  const batch = await shadcn(['add', ...rest.map((item) => `${registryNamespace}/${item.name}`), '-y', '-o']);
  if (!batch.ok) {
    console.log('  the batch failed, adding one item at a time to find the one that breaks it');
    for (const item of rest) {
      const one = await shadcn(['add', `${registryNamespace}/${item.name}`, '-y', '-o']);
      if (!one.ok) fail(item.name, 'install', `shadcn add exited with an error: ${tail(one.output, 1)}`);
    }
  }
  checkInstalled(all);

  step('Writing /kosmos-smoke and /kosmos-smoke/<name> pages');
  const withDemo = writePages(rest);
  for (const item of rest) if (!withDemo.includes(item.name)) console.log(`  ${item.name}: no docs preview or ${item.name}-demo.tsx, only its exports are imported`);

  step('Type checking the app (npm run typecheck)');
  const types = await run('npm', ['run', 'typecheck'], app);
  for (const match of plain(types.output).matchAll(/^(\S+?)\((\d+),\d+\): error (TS\d+: .+)$/gm)) {
    const name = itemForFile(match[1], all);
    fail(name ?? '(app)', 'types', `${match[1].replace(/^\.\//, '')}:${match[2]} ${match[3]}`);
  }
  if (!types.ok && ![...findings.values()].some((f) => f.types.length)) fail('(app)', 'types', tail(types.output, 1));
  if (!types.ok) {
    // So `next build` reports bundling and prerender errors too, instead of stopping at the type errors above.
    const config = join(app, 'next.config.ts');
    writeFileSync(config, readFileSync(config, 'utf8').replace(/(const nextConfig[^{]*\{)/, '$1\n  typescript: { ignoreBuildErrors: true },'));
    console.log('  type errors found: building with typescript.ignoreBuildErrors so the build reports the rest');
  }

  // `next build` stops at the first page that fails to prerender, so drop the items it names and build again.
  const excluded = new Set<string>();
  for (let attempt = 1; ; attempt++) {
    step(`Building the app (npm run build)${excluded.size ? `, without ${[...excluded].join(', ')}` : ''}`);
    if (excluded.size) writePages(rest.filter((item) => !excluded.has(item.name)));
    const next = await run('npm', ['run', 'build'], app);
    if (next.ok) break;
    const named = buildFailures(plain(next.output), all);
    const fresh = [...named.keys()].filter((name) => !excluded.has(name) && all.some((item) => item.name === name));
    for (const [name, message] of named) fail(name, 'build', message);
    if (!named.size) fail('(app)', 'build', tail(next.output, 3).replace(/\n/g, ' '));
    if (!fresh.length || attempt === 6) break;
    for (const name of fresh) excluded.add(name);
  }

  await checkShadcnSwap();
} catch (error) {
  fail('(app)', 'install', (error as Error).message);
  for (const name of [...all.map((item) => item.name), swapCase]) for (const check of ['install', 'types', 'build'] as Check[]) if (!findings.get(name)?.[check].length) skip(name, check);
} finally {
  registry.close();
}

// ── summary ──────────────────────────────────────────────────────────────────────────────────────
step('Summary');
const itemNames = new Set([...all.map((item) => item.name), swapCase]);
const width = Math.max(...[...itemNames].map((name) => name.length), 6) + 2;
console.log(`  ${'item'.padEnd(width)}${checks.map((check) => check.padEnd(9)).join('')}`);
const rows = [...itemNames, ...[...findings.keys()].filter((name) => !itemNames.has(name))];
for (const name of rows) {
  const found = findings.get(name);
  const cells = checks.map((check) => (found?.[check].length ? 'FAIL' : skipped.get(name)?.has(check) ? 'skip' : itemNames.has(name) ? 'ok' : '').padEnd(9));
  console.log(`  ${name.padEnd(width)}${cells.join('')}`);
}
const failures = [...findings.entries()].filter(([, found]) => checks.some((check) => found[check].length));
if (failures.length) {
  console.log('\n  Failures:');
  for (const [name, found] of failures) {
    for (const check of checks) for (const message of found[check]) console.log(`  ✘ ${name} [${check}] ${message}`);
  }
}
console.log(`\n  ${failures.length ? `✘ ${failures.length} of ${rows.length} failed` : `✔ all ${all.length} items installed, type checked and built`} in ${Math.round((Date.now() - started) / 1000)}s`);
console.log(`  app kept for inspection: ${app}`);
console.log(`  logs: ${logs}`);
console.log(`  open it: cd ${app} && npm run start, then /kosmos-smoke`);
process.exit(failures.length ? 1 : 0);
