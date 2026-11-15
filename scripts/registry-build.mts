// Usage: pnpm registry:build
// Composes every registry/**/<name>.registry.json into the root registry.json (generated, gitignored),
// runs `shadcn build` into public/r, then validates every output file against the shadcn schema and checks that
// none holds the site's brand colour (lib/brand.ts). It also writes one `preset-*` theme item per choice of the preset
// picker (lib/presets), which the index does not list, with that choice's DESIGN.md beside it at
// public/r/preset-*/DESIGN.md, and the site's own DESIGN.md at the repo root.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { registryItemSchema, registrySchema } from 'shadcn/schema';
import { findBrand, readBrandColors } from '../lib/brand.ts';
import { chosenPreset, defaultPreset, presetChoices, presetCss, presetDesignMd, presetDesignMdPath, presetRegistryItem, siteDesignMd } from '../lib/presets/index.ts';
import { readRegistryItems } from '../lib/registry.ts';
import { readKosmosTokens } from '../lib/tokens.ts';
import { siteUrl } from '../lib/shared.ts';

const root = process.cwd();
const outDir = join(root, 'public/r');

const tokensPath = join(root, 'registry/kosmos/styles/tokens.css');
const tokensCss = readFileSync(tokensPath, 'utf8');
const paletteComment = 'never these lines.\n */\n';
const paletteStart = tokensCss.indexOf(paletteComment) + paletteComment.length;
const paletteEnd = tokensCss.indexOf('/* Shadows,');
if (paletteStart < paletteComment.length || paletteEnd < paletteStart) {
  throw new Error('tokens.css has lost the comments around its palette');
}
const withPalette = `${tokensCss.slice(0, paletteStart)}${presetCss(defaultPreset)}\n${tokensCss.slice(paletteEnd)}`;
if (withPalette !== tokensCss) {
  writeFileSync(tokensPath, withPalette);
  console.log(`registry: wrote the ${defaultPreset.name} preset into tokens.css`);
}

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

const brandColors = readBrandColors(root);
const built = readdirSync(outDir).filter((file) => file.endsWith('.json'));
for (const file of built) {
  const source = readFileSync(join(outDir, file), 'utf8');
  const brandHits = findBrand(source, brandColors);
  if (brandHits.length) throw new Error(`public/r/${file} holds the site's brand colour (${brandHits.join(', ')}): it belongs to the site only`);
  const json = JSON.parse(source);
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

// One theme item per choice the preset picker offers, written straight from lib/presets and left out of the index,
// each with its DESIGN.md beside it.
const tokens = readKosmosTokens();
const choices = presetChoices();
for (const choice of choices) {
  const item = presetRegistryItem(choice);
  const json = { $schema: 'https://ui.shadcn.com/schema/registry-item.json', ...item };
  registryItemSchema.parse(json);
  const source = `${JSON.stringify(json, null, 2)}\n`;
  const designMd = presetDesignMd(chosenPreset(choice), tokens);
  for (const [label, text] of [[item.name, source], [`${item.name}/DESIGN.md`, designMd]]) {
    const brandHits = findBrand(text, brandColors);
    if (brandHits.length) throw new Error(`${label} holds the site's brand colour (${brandHits.join(', ')}): it belongs to the site only`);
  }
  writeFileSync(join(outDir, `${item.name}.json`), source);
  const designMdFile = join(root, 'public', presetDesignMdPath(choice));
  mkdirSync(join(designMdFile, '..'), { recursive: true });
  writeFileSync(designMdFile, designMd);
}

const sitePath = join(root, 'DESIGN.md');
const site = siteDesignMd(defaultPreset, tokens, brandColors);
if (!existsSync(sitePath) || readFileSync(sitePath, 'utf8') !== site) {
  writeFileSync(sitePath, site);
  console.log('registry: wrote the site DESIGN.md');
}

console.log(`registry: ${items.length} items -> public/r (${items.map((item) => item.name).join(', ')}), and ${choices.length} preset items with their DESIGN.md`);
