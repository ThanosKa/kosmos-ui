'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

type DataSet = 'demo' | 'worst';

const changeEvent = 'data-set-change';

function subscribe(onChange: () => void) {
  window.addEventListener(changeEvent, onChange);
  return () => window.removeEventListener(changeEvent, onChange);
}

const read = (): DataSet => (new URLSearchParams(window.location.search).get('data') === 'worst' ? 'worst' : 'demo');

function pick(next: string) {
  const url = new URL(window.location.href);
  if (next === 'worst') url.searchParams.set('data', 'worst');
  else url.searchParams.delete('data');
  window.history.replaceState(null, '', url);
  window.dispatchEvent(new Event(changeEvent));
}

/**
 * A review preview's Demo data / Worst case switch. `demo` is what the preview shows normally, `worst` holds the
 * worst-case data (long names, unbreakable emails, one-letter names, missing fields, huge counts, zero items, non-Latin
 * text, emoji, extreme numbers) and stays in the preview for good. The choice lives in `?data=worst`, so a reload keeps it.
 */
export function DataSetPreview({ demo, worst }: { demo: ReactNode; worst: ReactNode }) {
  const dataSet = useSyncExternalStore(subscribe, read, () => 'demo');
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <SegmentedControl aria-label="Data set" value={dataSet} onValueChange={pick} size="sm">
        <SegmentedControlItem value="demo">Demo data</SegmentedControlItem>
        <SegmentedControlItem value="worst">Worst case</SegmentedControlItem>
      </SegmentedControl>
      {dataSet === 'worst' ? worst : demo}
    </div>
  );
}
