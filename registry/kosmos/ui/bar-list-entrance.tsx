'use client';

import * as React from 'react';
import { type ChartEntrance, useChartEntrance } from '@/registry/kosmos/hooks/use-chart-motion';

/**
 * The `<ul>` of a Bar list, marked `data-waiting` until its entrance starts and `data-instant` while it skips it, so the
 * bars, rendered on the server, can grow in without the list becoming a client component.
 */
function BarListEntrance({ entrance, ...props }: React.ComponentProps<'ul'> & { entrance?: ChartEntrance }) {
  const list = React.useRef<HTMLUListElement>(null);
  const { revealed, instant } = useChartEntrance(list, entrance);
  return <ul ref={list} data-waiting={!revealed || undefined} data-instant={instant || undefined} {...props} />;
}

export { BarListEntrance };
