'use client';

import { ArrowUpRight, Lock, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';
import { PreviewFrame } from './preview-frame';

/** The preview widths, in CSS pixels; desktop takes the whole width of the viewer. */
const previewWidths = {
  desktop: { label: 'Desktop', icon: Monitor, width: undefined },
  tablet: { label: 'Tablet', icon: Tablet, width: 768 },
  phone: { label: 'Phone', icon: Smartphone, width: 375 },
} as const;
type PreviewWidth = keyof typeof previewWidths;

/** Blocks bring their own dialogs and drawers, so the frame keeps room for them even when the block is short. */
const previewMinHeight = 560;

/**
 * The Preview and Code tabs of a block viewer, with the preview width and a link that opens the preview alone. The
 * preview is an iframe, so the block's container queries answer to the width picked here. It stays mounted while
 * Code is open, so switching back does not reload it.
 */
export function BlockViewerPanels({
  title,
  previewUrl,
  code,
  locked,
}: {
  title: string;
  previewUrl: string;
  code: ReactNode;
  /** The code is not public (a Pro variant): the Code tab carries a lock. */
  locked?: boolean;
}) {
  const [tab, setTab] = useState('preview');
  const [width, setWidth] = useState<PreviewWidth>('desktop');
  const framed = previewWidths[width].width;

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="min-w-0 gap-0 rounded-2xl border border-transparent bg-card shadow-card [--inner-radius:calc(var(--radius-2xl)-1px)]"
    >
      <div className="flex min-w-0 items-center justify-between gap-2 border-b border-border px-2">
        <TabsList aria-label={`${title} view`} className="data-[orientation=horizontal]:border-b-0">
          <TabsTrigger value="preview" className="h-11">
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="h-11">
            {locked && <Lock data-icon="inline-start" aria-hidden />}
            Code
          </TabsTrigger>
        </TabsList>
        <div className="flex shrink-0 items-center gap-1.5">
          {tab === 'preview' && (
            <SegmentedControl
              aria-label="Preview width"
              value={width}
              onValueChange={(value) => setWidth(value as PreviewWidth)}
              className="max-lg:hidden"
            >
              {(Object.keys(previewWidths) as PreviewWidth[]).map((key) => {
                const { label, icon: Icon } = previewWidths[key];
                return (
                  <SegmentedControlItem key={key} value={key} aria-label={label} title={label}>
                    <Icon aria-hidden />
                  </SegmentedControlItem>
                );
              })}
            </SegmentedControl>
          )}
          <Button
            variant="secondary"
            size="icon"
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${title} in a new tab`}
            title="Open in a new tab"
          >
            <ArrowUpRight aria-hidden />
          </Button>
        </div>
      </div>
      <TabsContent value="preview" keepMounted className="focus-visible:-outline-offset-2">
        <div data-block-viewer-stage="" className="flex justify-center overflow-hidden rounded-b-(--inner-radius) bg-muted">
          <div
            className={cn('box-content max-w-full', framed ? 'w-(--preview-width) border-x border-border' : 'w-full')}
            style={framed ? ({ '--preview-width': `${framed}px` } as CSSProperties) : undefined}
          >
            <PreviewFrame src={previewUrl} title={`${title} preview`} minHeight={previewMinHeight} className="rounded-none" />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="code" className="overflow-hidden rounded-b-(--inner-radius) focus-visible:-outline-offset-2">
        {code}
      </TabsContent>
    </Tabs>
  );
}
