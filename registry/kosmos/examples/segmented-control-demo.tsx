import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

export default function SegmentedControlDemo() {
  return (
    <SegmentedControl aria-label="Time range" defaultValue="30d">
      <SegmentedControlItem value="7d">7 days</SegmentedControlItem>
      <SegmentedControlItem value="30d">30 days</SegmentedControlItem>
      <SegmentedControlItem value="90d">90 days</SegmentedControlItem>
    </SegmentedControl>
  );
}
