/** A page number, or a gap standing for the pages hidden before or after the current one. */
type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

/**
 * The page buttons to show: the first and last page, `siblings` pages either side of the current one,
 * and a gap for each run of hidden pages. The list keeps the same length on every page, so the row never
 * changes width under the pointer, and a gap never hides a single page: that page shows instead.
 */
function paginationItems(page: number, pageCount: number, siblings = 1): PaginationItem[] {
  const slots = siblings * 2 + 5;
  if (pageCount <= slots) return range(1, pageCount);
  const start = Math.max(3, Math.min(page - siblings, pageCount - siblings * 2 - 2));
  const end = Math.min(pageCount - 2, Math.max(page + siblings, siblings * 2 + 3));
  return [
    1,
    start > 3 ? 'ellipsis-start' : 2,
    ...range(start, end),
    end < pageCount - 2 ? 'ellipsis-end' : pageCount - 1,
    pageCount,
  ];
}

/**
 * The page buttons for a row that narrows: every item of the wide row (`siblings` either side) and of the
 * narrow one (no siblings), in order, each marked with the widths it shows at. Both rows keep their length.
 */
function paginationItemsByWidth(page: number, pageCount: number, siblings = 1) {
  const wide = paginationItems(page, pageCount, siblings);
  const narrow = paginationItems(page, pageCount, 0);
  const position = (item: PaginationItem) =>
    item === 'ellipsis-start' ? 1.5 : item === 'ellipsis-end' ? pageCount - 0.5 : item;
  return [...new Set([...wide, ...narrow])]
    .sort((a, b) => position(a) - position(b))
    .map((item) => ({ item, wide: wide.includes(item), narrow: narrow.includes(item) }));
}

/** How many pages it takes to hold `total` rows, `pageSize` to a page. An empty list still has one page. */
function pageCount(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** The page itself, or the nearest end when it falls outside `1` to `pageCount`, as after a filter shortens the list. */
function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(1, page), Math.max(1, pageCount));
}

/** The rows a page shows, counted from one (`{ from: 21, to: 30 }`), or `{ from: 0, to: 0 }` for an empty list. */
function pageRows(page: number, pageSize: number, total: number) {
  if (total <= 0) return { from: 0, to: 0 };
  const from = (page - 1) * pageSize + 1;
  return { from, to: Math.min(total, from + pageSize - 1) };
}

/** The page that holds the current page's first row once the page size changes, so the rows in view stay in view. */
function pageForPageSize(page: number, pageSize: number, nextPageSize: number) {
  return Math.floor(((page - 1) * pageSize) / nextPageSize) + 1;
}

export { clampPage, pageCount, pageForPageSize, pageRows, paginationItems, paginationItemsByWidth, type PaginationItem };
