'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The preview route in an iframe, sized to its content. No `?theme`, so the frame
 * follows the docs theme toggle (next-themes syncs both documents through localStorage).
 */
export function PreviewFrame({ name, minHeight = 240 }: { name: string; minHeight?: number }) {
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
    iframe.addEventListener('load', onLoad);
    if (iframe.contentDocument?.readyState === 'complete') measure();
    return () => {
      iframe.removeEventListener('load', onLoad);
      observer?.disconnect();
    };
  }, [minHeight]);

  return (
    <iframe
      ref={ref}
      src={`/view/${name}`}
      title={`${name} preview`}
      loading="lazy"
      style={{ height }}
      className="block w-full rounded-lg bg-fd-background"
    />
  );
}
