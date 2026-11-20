// Usage: node --test lib/third-party-notices.test.mts
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { readRegistryItems, type RegistryItem } from './registry.ts';

type Notices = { exists: (path: string) => boolean; read: (path: string) => string };

const noticePattern = /^LICENSE-[A-Z0-9-]+$/;
const noticeName = (path: string) => path.split('/').pop()!;

/** The problems with how registry items ship the third-party notice of the MIT code they start from (ADR 0010). */
function noticeProblems(items: RegistryItem[], allFiles: string[], notices: Notices): string[] {
  const problems: string[] = [];
  const shipped = new Set<string>();
  for (const item of items) {
    const sources = Array.isArray(item.meta?.sources) ? (item.meta.sources as string[]) : [];
    const noticeFiles = (item.files ?? []).filter((file) => noticePattern.test(noticeName(file.path)));
    for (const file of noticeFiles) shipped.add(file.path);
    for (const source of sources) {
      const name = `LICENSE-${source.toUpperCase()}`;
      const file = noticeFiles.find((candidate) => noticeName(candidate.path) === name);
      if (!file) problems.push(`${item.name}: meta.sources names "${source}" but files lists no ${name}`);
      else if (!notices.exists(file.path)) problems.push(`${item.name}: ${file.path} does not exist`);
      else if (!/^Copyright /m.test(notices.read(file.path))) problems.push(`${item.name}: ${file.path} holds no Copyright line`);
      else if (file.target !== `~/${name}`) problems.push(`${item.name}: ${name} installs to ${file.target}, expected ~/${name}`);
    }
    for (const file of noticeFiles) {
      if (!sources.some((source) => noticeName(file.path) === `LICENSE-${source.toUpperCase()}`)) {
        problems.push(`${item.name}: ships ${noticeName(file.path)} but meta.sources does not name it`);
      }
    }
  }
  for (const path of allFiles) {
    if (!shipped.has(path)) problems.push(`${path} ships with no registry item`);
  }
  return problems;
}

const fixtureFiles: Record<string, string> = {
  'registry/kosmos/ui/LICENSE-ACME': 'MIT License\n\nCopyright (c) 2024 Acme\n',
  'registry/kosmos/ui/LICENSE-EMPTY': 'MIT License\n',
};
const fixtureNotices: Notices = {
  exists: (path) => path in fixtureFiles,
  read: (path) => fixtureFiles[path],
};
const notice = (id: string, target = `~/LICENSE-${id}`) => ({ path: `registry/kosmos/ui/LICENSE-${id}`, type: 'registry:file', target });
const item = (name: string, sources: string[] | undefined, files: RegistryItem['files']): RegistryItem => ({
  name,
  type: 'registry:ui',
  meta: { group: 'effects', ...(sources ? { sources } : {}) },
  files: [{ path: `registry/kosmos/ui/${name}.tsx`, type: 'registry:ui' }, ...(files ?? [])],
});

test('a marked item that ships its notice passes', () => {
  const items = [item('fade', ['acme'], [notice('ACME')])];
  assert.deepEqual(noticeProblems(items, ['registry/kosmos/ui/LICENSE-ACME'], fixtureNotices), []);
});

test('flags a source whose notice the item does not list', () => {
  const items = [item('fade', ['acme'], [])];
  assert.deepEqual(noticeProblems(items, [], fixtureNotices), ['fade: meta.sources names "acme" but files lists no LICENSE-ACME']);
});

test('flags a notice with no Copyright line', () => {
  const items = [item('fade', ['empty'], [notice('EMPTY')])];
  assert.deepEqual(noticeProblems(items, ['registry/kosmos/ui/LICENSE-EMPTY'], fixtureNotices), [
    'fade: registry/kosmos/ui/LICENSE-EMPTY holds no Copyright line',
  ]);
});

test('flags a notice that does not install to the project root', () => {
  const items = [item('fade', ['acme'], [notice('ACME', 'LICENSE-ACME')])];
  assert.deepEqual(noticeProblems(items, ['registry/kosmos/ui/LICENSE-ACME'], fixtureNotices), [
    'fade: LICENSE-ACME installs to LICENSE-ACME, expected ~/LICENSE-ACME',
  ]);
});

test('flags a shipped notice the item does not name in meta.sources', () => {
  const items = [item('fade', undefined, [notice('ACME')])];
  assert.deepEqual(noticeProblems(items, ['registry/kosmos/ui/LICENSE-ACME'], fixtureNotices), [
    'fade: ships LICENSE-ACME but meta.sources does not name it',
  ]);
});

test('flags a notice file no item ships', () => {
  assert.deepEqual(noticeProblems([], ['registry/kosmos/ui/LICENSE-ACME'], fixtureNotices), ['registry/kosmos/ui/LICENSE-ACME ships with no registry item']);
});

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? filesUnder(join(dir, entry.name)) : [join(dir, entry.name)]));
}

test('every registry item ships the notices of its sources', () => {
  const root = join(import.meta.dirname, '..');
  const allFiles = filesUnder(join(root, 'registry'))
    .filter((path) => noticePattern.test(noticeName(path)))
    .map((path) => path.slice(root.length + 1));
  const notices: Notices = { exists: (path) => existsSync(join(root, path)), read: (path) => readFileSync(join(root, path), 'utf8') };
  assert.deepEqual(noticeProblems(readRegistryItems(root), allFiles, notices), []);
});
