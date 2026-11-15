// Usage: node --test lib/paging.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clampPage, pageCount, pageForPageSize, pageRows, paginationItems, paginationItemsByWidth } from '../registry/kosmos/lib/paging.ts';

test('a short list shows every page', () => {
  assert.deepEqual(paginationItems(3, 5), [1, 2, 3, 4, 5]);
});

test('a long list keeps the first and last page and the pages around the current one', () => {
  assert.deepEqual(paginationItems(10, 20), [1, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 20]);
});

test('a gap never stands for a single page', () => {
  assert.deepEqual(paginationItems(4, 20), [1, 2, 3, 4, 5, 'ellipsis-end', 20]);
  assert.deepEqual(paginationItems(17, 20), [1, 'ellipsis-start', 16, 17, 18, 19, 20]);
});

test('the row keeps its length on every page and always shows the current page', () => {
  for (const siblings of [0, 1, 2]) {
    const lengths = new Set<number>();
    for (let page = 1; page <= 40; page++) {
      const items = paginationItems(page, 40, siblings);
      assert.ok(items.includes(page), `page ${page} with ${siblings} siblings`);
      lengths.add(items.length);
    }
    assert.deepEqual([...lengths], [siblings * 2 + 5]);
  }
});

test('more siblings show more pages around the current one', () => {
  assert.deepEqual(paginationItems(10, 20, 2), [1, 'ellipsis-start', 8, 9, 10, 11, 12, 'ellipsis-end', 20]);
  assert.deepEqual(paginationItems(10, 20, 0), [1, 'ellipsis-start', 10, 'ellipsis-end', 20]);
});

test('a page out of range shows the nearest end', () => {
  assert.deepEqual(paginationItems(99, 20), paginationItems(20, 20));
  assert.deepEqual(paginationItems(-3, 20), paginationItems(1, 20));
});

test('a narrow row drops the neighbors of the current page and keeps the rest in order', () => {
  const at = (page: number, pageCount: number) =>
    paginationItemsByWidth(page, pageCount).map(({ item, wide, narrow }) => `${item}${wide ? '' : ' narrow only'}${narrow ? '' : ' wide only'}`);
  assert.deepEqual(at(10, 20), ['1', 'ellipsis-start', '9 wide only', '10', '11 wide only', 'ellipsis-end', '20']);
  assert.deepEqual(at(4, 20), [
    '1',
    'ellipsis-start narrow only',
    '2 wide only',
    '3 wide only',
    '4',
    '5 wide only',
    'ellipsis-end',
    '20',
  ]);
  assert.deepEqual(at(2, 4), ['1', '2', '3', '4']);
});

test('a list has as many pages as it takes to hold every row, and at least one', () => {
  assert.equal(pageCount(2450, 10), 245);
  assert.equal(pageCount(2451, 10), 246);
  assert.equal(pageCount(0, 10), 1);
});

test('a page shows rows from–to, counted from one', () => {
  assert.deepEqual(pageRows(3, 10, 2450), { from: 21, to: 30 });
  assert.deepEqual(pageRows(246, 10, 2451), { from: 2451, to: 2451 });
  assert.deepEqual(pageRows(1, 10, 0), { from: 0, to: 0 });
});

test('a page past either end moves to that end', () => {
  assert.equal(clampPage(9, 4), 4);
  assert.equal(clampPage(0, 4), 1);
  assert.equal(clampPage(3, 4), 3);
});

test('a new page size keeps the first row of the page in view', () => {
  assert.equal(pageForPageSize(3, 10, 25), 1);
  assert.equal(pageForPageSize(7, 10, 25), 3);
  assert.equal(pageForPageSize(2, 50, 10), 6);
});
