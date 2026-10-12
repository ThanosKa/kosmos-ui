// Usage: pnpm registry:build
// Composes every registry/**/<name>.registry.json into the root registry.json (generated, gitignored),
// runs `shadcn build` into public/r, then validates every output file against the shadcn schema.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { registryItemSchema, registrySchema } from 'shadcn/schema';
import { readRegistryItems } from '../lib/registry.ts';
import { siteUrl } from '../lib/shared.ts';

const root = process.cwd();
const outDir = join(root, 'public/r');

const items = readRegistryItems(root);
const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'kosmos',
  homepage: siteUrl,
  items,
};
registrySchema.parse(registry);
writeFileSync(join(root, 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`);

rmSync(outDir, { recursive: true, force: true });
execFileSync(join(root, 'node_modules/.bin/shadcn'), ['build', 'registry.json', '-o', 'public/r', '-c', root], {
  cwd: root,
  stdio: ['ignore', 'ignore', 'inherit'],
});

const built = readdirSync(outDir).filter((file) => file.endsWith('.json'));
for (const file of built) {
  const json = JSON.parse(readFileSync(join(outDir, file), 'utf8'));
  if (file === 'registry.json') {
    registrySchema.parse(json);
    continue;
  }
  const item = registryItemSchema.parse(json);
  for (const f of item.files ?? []) {
    if (!f.content) throw new Error(`public/r/${file}: ${f.path} has no content`);
  }
}
const missing = items.filter((item) => !built.includes(`${item.name}.json`));
if (missing.length) throw new Error(`No output for: ${missing.map((item) => item.name).join(', ')}`);

console.log(`registry: ${items.length} items -> public/r (${items.map((item) => item.name).join(', ')})`);
