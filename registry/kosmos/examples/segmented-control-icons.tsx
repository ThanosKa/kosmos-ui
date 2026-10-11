import { Columns3, LayoutGrid, List } from 'lucide-react';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

export default function SegmentedControlIcons() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SegmentedControl aria-label="View" defaultValue="board">
        <SegmentedControlItem value="list">
          <List data-icon="inline-start" />
          List
        </SegmentedControlItem>
        <SegmentedControlItem value="board">
          <Columns3 data-icon="inline-start" />
          Board
        </SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="View" defaultValue="list">
        <SegmentedControlItem value="list" aria-label="List">
          <List />
        </SegmentedControlItem>
        <SegmentedControlItem value="board" aria-label="Board">
          <Columns3 />
        </SegmentedControlItem>
        <SegmentedControlItem value="grid" aria-label="Grid">
          <LayoutGrid />
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}
