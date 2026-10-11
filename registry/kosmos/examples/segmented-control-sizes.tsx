import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

export default function SegmentedControlSizes() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SegmentedControl aria-label="Period" defaultValue="week" size="sm">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="Period" defaultValue="week" size="md">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}
