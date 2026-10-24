/** The measured widths of a breadcrumb trail, in pixels. */
type BreadcrumbFit = {
  /** Each crumb at its natural width, from the root to the current page. */
  widths: readonly number[];
  /** The gap on each side of a separator. */
  gap: number;
  separatorWidth: number;
  /** The button that opens the hidden crumbs. */
  ellipsisWidth: number;
  /** The width the trail may take. */
  available: number;
};

/**
 * How many crumbs after the first to hide behind the ellipsis so the trail fits `available`. The first crumb
 * and the current page always stay. When no count fits, it is the count that leaves the trail narrowest,
 * and the visible crumbs truncate.
 */
function hiddenCrumbCount({ widths, gap, separatorWidth, ellipsisWidth, available }: BreadcrumbFit): number {
  if (widths.length < 3) return 0;
  const between = gap + separatorWidth + gap;
  const widthHiding = (hidden: number) => {
    const shown = [widths[0], ...(hidden > 0 ? [ellipsisWidth] : []), ...widths.slice(hidden + 1)];
    return shown.reduce((sum, width) => sum + width, 0) + (shown.length - 1) * between;
  };
  let narrowest = 0;
  for (let hidden = 0; hidden <= widths.length - 2; hidden++) {
    const width = widthHiding(hidden);
    if (width <= available + 0.5) return hidden;
    if (width < widthHiding(narrowest)) narrowest = hidden;
  }
  return narrowest;
}

export { hiddenCrumbCount, type BreadcrumbFit };
