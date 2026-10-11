'use client';

import { useState } from 'react';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

const totals: Record<string, string> = { '7d': '$4,210', '30d': '$18,940', '90d': '$52,375' };

export default function SegmentedControlControlled() {
  const [range, setRange] = useState('30d');
  return (
    <div className="flex flex-col items-start gap-3">
      <SegmentedControl aria-label="Time range" value={range} onValueChange={setRange}>
        <SegmentedControlItem value="7d">7 days</SegmentedControlItem>
        <SegmentedControlItem value="30d">30 days</SegmentedControlItem>
        <SegmentedControlItem value="90d">90 days</SegmentedControlItem>
      </SegmentedControl>
      <p className="text-body">
        Revenue: <span className="font-medium tabular-nums">{totals[range]}</span>
      </p>
    </div>
  );
}
