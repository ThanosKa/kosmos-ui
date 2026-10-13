'use client';

import { ArrowUpRight, Lock, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';
import { PreviewFrame } from './preview-frame';

/**
 * The preview widths, in CSS pixels; desktop takes the whole width of the viewer. The width control shows only once
 * the viewer fits the tablet frame (768px plus its two borders), so every width it offers is exact; a narrower viewer
 * previews at its own width.
 */
const previewWidths = {
  desktop: { label: 'Desktop', icon: Monitor, width: undefined },
  tablet: { label: 'Tablet', icon: Tablet, width: 768 },
  phone: { label: 'Phone', icon: Smartphone, width: 375 },
} as const;
type PreviewWidth = keyof typeof previewWidths;

/** Blocks bring their own dialogs and drawers, so the frame keeps room for them even when the block is short. */
const previewMinHeight = 560;

/**
 * A preview on another origin (the Pro deployment) cannot read the docs theme, which next-themes keeps in this
 * origin's storage, so it gets the theme in its address. Undefined until the page has hydrated and the theme is
 * known (the server cannot know it), so the frame loads once, in the right theme.
 */
const subscribeToNothing = () => () => {};

function useThemedPreviewUrl(previewUrl: string) {
  const { resolvedTheme } = useTheme();
  const hydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  if (!/^https?:\/\//.test(previewUrl)) return previewUrl;
  if (!hydrated || !resolvedTheme) return undefined;
  const url = new URL(previewUrl);
  url.searchParams.set('theme', resolvedTheme);
  return url.href;
}

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
  const src = useThemedPreviewUrl(previewUrl);

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="@container/viewer min-w-0 gap-0 rounded-2xl border border-transparent bg-card p-px shadow-card [--inner-radius:calc(var(--radius-2xl)-2px)]"
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
              className="hidden @min-[770px]/viewer:inline-flex"
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
            href={src ?? previewUrl}
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
            className={cn('box-content w-full', framed && '@min-[770px]/viewer:w-(--preview-width) @min-[770px]/viewer:border-x @min-[770px]/viewer:border-border')}
            style={framed ? ({ '--preview-width': `${framed}px` } as CSSProperties) : undefined}
          >
            {src ? (
              <PreviewFrame src={src} title={`${title} preview`} minHeight={previewMinHeight} className="rounded-none" />
            ) : (
              <div aria-hidden className="h-140 bg-background" />
            )}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="code" className="overflow-hidden rounded-b-(--inner-radius) focus-visible:-outline-offset-2">
        {code}
      </TabsContent>
    </Tabs>
  );
}
