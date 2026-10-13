'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

/**
 * A preview route in an iframe, sized to its content. A `src` without `?theme=` follows the docs theme
 * toggle (next-themes syncs both documents through localStorage); with it the frame is pinned to that theme
 * (the approval page shows light and dark side by side). A page on another origin can't be measured, so it
 * reports its own height with a `kosmos:preview-height` message (the Pro previews do); until then its frame keeps
 * `minHeight`.
 */
export function PreviewFrame({
  src,
  title,
  minHeight = 240,
  className,
}: {
  src: string;
  title: string;
  minHeight?: number;
  className?: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    let observer: ResizeObserver | undefined;
    const measure = () => {
      const doc = iframe.contentDocument;
      const root = doc?.querySelector<HTMLElement>('[data-preview-root]');
      const content = doc?.querySelector<HTMLElement>('[data-preview-content]');
      if (!doc?.defaultView || !root || !content) return;
      const style = doc.defaultView.getComputedStyle(root);
      const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      setHeight(Math.max(minHeight, Math.ceil(content.getBoundingClientRect().height + padding)));
      if (!observer) {
        observer = new ResizeObserver(measure);
        observer.observe(content);
      }
    };
    const onLoad = () => {
      observer?.disconnect();
      observer = undefined;
      measure();
    };
    const onMessage = (event: MessageEvent) => {
      const { type, height: reported } = (event.data ?? {}) as { type?: unknown; height?: unknown };
      if (event.source !== iframe.contentWindow || type !== 'kosmos:preview-height' || typeof reported !== 'number') return;
      setHeight(Math.max(minHeight, Math.ceil(reported)));
    };
    iframe.addEventListener('load', onLoad);
    window.addEventListener('message', onMessage);
    if (iframe.contentDocument?.readyState === 'complete') measure();
    return () => {
      iframe.removeEventListener('load', onLoad);
      window.removeEventListener('message', onMessage);
      observer?.disconnect();
    };
  }, [minHeight]);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      loading="lazy"
      style={{ height }}
      className={cn('block w-full rounded-lg bg-background', className)}
    />
  );
}
