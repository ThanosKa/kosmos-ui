/** One way to narrow a list, such as plan or platform: the values a row can take, and how to read a row's value. */
type Facet<Row> = { key: string; values: readonly string[]; valueOf: (row: Row) => string };

/** The filter values that belong to this facet. */
const valuesOn = <Row>(facet: Facet<Row>, filters: readonly string[]) => filters.filter((value) => facet.values.includes(value));

/**
 * Whether a row passes the filters that are on, a flat list of values (`['pro', 'ios']`). Values of one facet widen
 * the match among themselves, facets narrow each other, and a value no facet knows is ignored. `except` leaves one
 * facet out, as its own counts need.
 */
function matchesFacets<Row>(row: Row, facets: readonly Facet<Row>[], filters: readonly string[], except?: string) {
  return facets.every((facet) => {
    if (facet.key === except) return true;
    const on = valuesOn(facet, filters);
    return !on.length || on.includes(facet.valueOf(row));
  });
}

/**
 * How many rows each value of a facet would show: the rows that pass every other facet and have that value. Values
 * no row has count 0, so an option keeps its place in the list.
 */
function facetCounts<Row>(rows: readonly Row[], facets: readonly Facet<Row>[], filters: readonly string[], key: string) {
  const facet = facets.find((item) => item.key === key);
  if (!facet) return {};
  const counts: Record<string, number> = Object.fromEntries(facet.values.map((value) => [value, 0]));
  for (const row of rows) {
    if (!matchesFacets(row, facets, filters, key)) continue;
    const value = facet.valueOf(row);
    if (value in counts) counts[value] += 1;
  }
  return counts;
}

export { facetCounts, matchesFacets, type Facet };
