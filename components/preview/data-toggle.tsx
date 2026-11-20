'use client';

import type { ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

const param = 'data';

/** True when the preview URL carries `?data=worst`, so a reload keeps the dataset. */
export function useWorstCase() {
  return useSearchParams().get(param) === 'worst';
}

/**
 * The Demo data / Worst case switch of a review preview. The choice lives in the URL (`?data=worst`), so the site check
 * can open either dataset and a reload keeps it. Put it first in the preview and wrap the parts that change in `DataSet`.
 */
export function DataToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = useWorstCase() ? 'worst' : 'demo';
  return (
    <div data-data-toggle className="flex">
      <SegmentedControl
        aria-label="Dataset"
        value={value}
        onValueChange={(next) => {
          const query = new URLSearchParams(searchParams);
          if (next === 'worst') query.set(param, 'worst');
          else query.delete(param);
          const search = query.toString();
          router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
        }}
      >
        <SegmentedControlItem value="demo">Demo data</SegmentedControlItem>
        <SegmentedControlItem value="worst">Worst case</SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}

/** Shows `demo` or `worst` according to the toggle. Both come from the preview, so the worst-case data sits beside the demo data it replaces. */
export function DataSet({ demo, worst }: { demo: ReactNode; worst: ReactNode }) {
  return useWorstCase() ? worst : demo;
}
