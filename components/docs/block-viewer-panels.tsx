'use client';

import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { PreviewFrame } from './preview-frame';
import { PreviewShell } from './preview-shell';

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

/** A short block is centered in a frame this tall; a taller one sets the height. Overlay demos bring their own frame. */
const previewMinHeight = 320;

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
 * The preview of a block viewer in the shared preview shell, with the preview width. The preview is an iframe, so
 * the block's container queries answer to the width picked here.
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
  const [width, setWidth] = useState<PreviewWidth>('desktop');
  const framed = previewWidths[width].width;
  const src = useThemedPreviewUrl(previewUrl);

  return (
    <PreviewShell
      title={title}
      href={src ?? previewUrl}
      locked={locked}
      code={code}
      stageClassName="flex justify-center bg-muted"
      actions={
        <SegmentedControl
          aria-label="Preview width"
          value={width}
          onValueChange={(value) => setWidth(value as PreviewWidth)}
          className="hidden group-data-[tab=code]/shell:invisible @min-[770px]/viewer:inline-flex"
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
      }
      stage={
        <div
          className={cn('box-content w-full transition-[width] duration-slow ease-smooth-in-out motion-reduce:transition-none', framed && '@min-[770px]/viewer:w-(--preview-width) @min-[770px]/viewer:border-x @min-[770px]/viewer:border-border')}
          style={framed ? ({ '--preview-width': `${framed}px` } as CSSProperties) : undefined}
        >
          {src ? (
            <PreviewFrame src={src} title={`${title} preview`} minHeight={previewMinHeight} className="rounded-none" />
          ) : (
            <div aria-hidden className="h-80 bg-background" />
          )}
        </div>
      }
    />
  );
}
