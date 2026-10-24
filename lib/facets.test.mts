// Usage: node --test lib/facets.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { facetCounts, matchesFacets, type Facet } from '../registry/kosmos/lib/facets.ts';

type Row = { id: string; plan: string; platform: string };

const rows: Row[] = [
  { id: 'a', plan: 'pro', platform: 'web' },
  { id: 'b', plan: 'pro', platform: 'ios' },
  { id: 'c', plan: 'scale', platform: 'web' },
  { id: 'd', plan: 'free', platform: 'android' },
];

const facets: Facet<Row>[] = [
  { key: 'plan', values: ['free', 'pro', 'scale'], valueOf: (row) => row.plan },
  { key: 'platform', values: ['web', 'ios', 'android', 'server'], valueOf: (row) => row.platform },
];

const ids = (filters: string[]) => rows.filter((row) => matchesFacets(row, facets, filters)).map((row) => row.id);

test('with no filters on, every row passes', () => {
  assert.deepEqual(ids([]), ['a', 'b', 'c', 'd']);
});

test('values of one facet widen the match among themselves', () => {
  assert.deepEqual(ids(['pro', 'scale']), ['a', 'b', 'c']);
});

test('two facets narrow each other', () => {
  assert.deepEqual(ids(['pro', 'scale', 'web']), ['a', 'c']);
});

test('a value no facet knows is ignored', () => {
  assert.deepEqual(ids(['archived']), ['a', 'b', 'c', 'd']);
  assert.deepEqual(ids(['archived', 'free']), ['d']);
});

test('each value counts the rows that would show with it, every other facet applied', () => {
  assert.deepEqual(facetCounts(rows, facets, ['web'], 'plan'), { free: 0, pro: 1, scale: 1 });
});

test("a facet's own values leave its counts alone", () => {
  assert.deepEqual(facetCounts(rows, facets, ['pro'], 'plan'), { free: 1, pro: 2, scale: 1 });
  assert.deepEqual(facetCounts(rows, facets, ['pro'], 'platform'), { web: 1, ios: 1, android: 0, server: 0 });
});

test('an unknown facet counts nothing', () => {
  assert.deepEqual(facetCounts(rows, facets, [], 'region'), {});
});
