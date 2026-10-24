/** The measured widths of a breadcrumb trail, in pixels. */
type BreadcrumbFit = {
  /** Each crumb at its natural width, from the root to the current page. */
  widths: readonly number[];
  /** The gap on each side of a separator. */
  gap: number;
  separatorWidth: number;
  ellipsisWidth: number;
  available: number;
};

/** The crumbs behind the ellipsis: `count` of them from index `start`. */
type HiddenCrumbs = { start: number; count: number };

/**
 * Which crumbs to hide behind the ellipsis so the trail fits `available`. The crumbs after the first go first,
 * nearest the root first. When the first crumb, the ellipsis and the current page still do not fit, the first
 * crumb goes too. The current page always stays, and truncates when even it alone is too wide.
 */
function hiddenCrumbs({ widths, gap, separatorWidth, ellipsisWidth, available }: BreadcrumbFit): HiddenCrumbs {
  const between = gap + separatorWidth + gap;
  const widthWithout = ({ start, count }: HiddenCrumbs) => {
    const shown = [...widths.slice(0, start), ...(count > 0 ? [ellipsisWidth] : []), ...widths.slice(start + count)];
    return shown.reduce((sum, width) => sum + width, 0) + (shown.length - 1) * between;
  };
  for (let count = 0; count <= widths.length - 2; count++) {
    if (widthWithout({ start: 1, count }) <= available + 0.5) return { start: 1, count };
  }
  return widths.length < 2 ? { start: 1, count: 0 } : { start: 0, count: widths.length - 1 };
}

export { hiddenCrumbs, type BreadcrumbFit, type HiddenCrumbs };
