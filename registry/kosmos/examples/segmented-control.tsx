'use client';

import { Columns3, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

const rows = ['selected item', 'other item'] as const;

function Controlled() {
  const [range, setRange] = useState('30d');
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SegmentedControl aria-label="Time range" value={range} onValueChange={setRange}>
        <SegmentedControlItem value="7d">7 days</SegmentedControlItem>
        <SegmentedControlItem value="30d">30 days</SegmentedControlItem>
        <SegmentedControlItem value="90d">90 days</SegmentedControlItem>
        <SegmentedControlItem value="12m">12 months</SegmentedControlItem>
      </SegmentedControl>
      <p className="text-small text-muted-foreground tabular-nums">Showing: {range}</p>
    </div>
  );
}

export default function SegmentedControlPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Item × states">
        <StateMatrix
          rows={rows}
          render={(row, state) => (
            <SegmentedControl aria-label="Period" defaultValue="day">
              <SegmentedControlItem value="day" {...(row === 'selected item' ? previewState(state) : {})}>
                Day
              </SegmentedControlItem>
              <SegmentedControlItem value="week" {...(row === 'other item' ? previewState(state) : {})}>
                Week
              </SegmentedControlItem>
            </SegmentedControl>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Sizes">
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
      </PreviewSection>

      <PreviewSection title="Icons, icon only">
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
            <SegmentedControlItem value="grid">
              <LayoutGrid data-icon="inline-start" />
              Grid
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
          <SegmentedControl aria-label="View" defaultValue="list" size="sm">
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
      </PreviewSection>

      <PreviewSection title="Controlled">
        <Controlled />
      </PreviewSection>

      <PreviewSection title="Disabled group, full width">
        <div className="flex max-w-sm flex-col gap-4">
          <SegmentedControl aria-label="Billing" defaultValue="monthly" disabled>
            <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
            <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
          </SegmentedControl>
          <SegmentedControl aria-label="Billing" defaultValue="yearly" className="w-full">
            <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
            <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
          </SegmentedControl>
        </div>
      </PreviewSection>

      <PreviewSection title="Long labels in a narrow slot (labels wrap)">
        <div className="w-64">
          <SegmentedControl aria-label="Audience" defaultValue="everyone" className="w-full">
            <SegmentedControlItem value="everyone">Everyone in the workspace</SegmentedControlItem>
            <SegmentedControlItem value="team">Only my team</SegmentedControlItem>
          </SegmentedControl>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
