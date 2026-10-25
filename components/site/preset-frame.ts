'use client';

/*
 * How a site page drives a preview iframe that shows several screens (the landing's dashboard, the Presets page):
 * the page sends the screen through `postMessage`, and the frame reports a screen a visitor opens inside it. The
 * preset and the theme need no message: the frame's document reads the site's own (`site-preset.tsx`, next-themes).
 */
import * as React from 'react';

const hostSource = 'kosmos-site';
const frameSource = 'kosmos-preview';

type HostMessage = { source: typeof hostSource; type: 'hello' } | { source: typeof hostSource; type: 'page'; page: string };
type FrameMessage = { source: typeof frameSource; type: 'ready' } | { source: typeof frameSource; type: 'page'; page: string };

type Payload<M> = M extends unknown ? Omit<M, 'source'> : never;

function toFrame(frame: HTMLIFrameElement | null, message: Payload<HostMessage>) {
  frame?.contentWindow?.postMessage({ source: hostSource, ...message }, window.location.origin);
}

function toHost(message: Payload<FrameMessage>) {
  window.parent.postMessage({ source: frameSource, ...message }, window.location.origin);
}

/** The message, when it comes from the same origin and the expected side. */
function readMessage<M extends HostMessage | FrameMessage>(event: MessageEvent, from: M['source']): M | null {
  if (event.origin !== window.location.origin) return null;
  const data = event.data as { source?: unknown } | null;
  return data && typeof data === 'object' && data.source === from ? (data as M) : null;
}

/** The page side: sends `page` each time it changes or the frame loads again, and reports screens opened inside the frame through `onPage`. */
export function usePreviewHost(frame: React.RefObject<HTMLIFrameElement | null>, { page, onPage }: { page: string; onPage: (page: string) => void }) {
  // Counts the frame's loads: each fresh document starts on its first screen and needs the page's screen again.
  const [loads, setLoads] = React.useState(0);
  const onPageRef = React.useRef(onPage);
  React.useEffect(() => {
    onPageRef.current = onPage;
  });

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const message = readMessage<FrameMessage>(event, frameSource);
      if (message?.type === 'ready') setLoads((count) => count + 1);
      else if (message?.type === 'page') onPageRef.current(message.page);
    };
    window.addEventListener('message', onMessage);
    // The frame may have loaded before this page hydrated, and its first "ready" went unheard.
    toFrame(frame.current, { type: 'hello' });
    return () => window.removeEventListener('message', onMessage);
  }, [frame]);

  // The page leads: a "ready" can arrive after a screen was chosen (the reply to "hello"), so each load is sent the screen.
  React.useEffect(() => {
    if (loads > 0) toFrame(frame.current, { type: 'page', page });
  }, [frame, loads, page]);
}

const noSubscription = () => () => {};

/**
 * The frame side: the screen the page sends, `openPage` for a screen a visitor opens inside the frame, and `ready`
 * once the document has hydrated and taken the site's preset.
 */
export function usePreviewFrame(firstPage: string) {
  const [page, setPage] = React.useState(firstPage);
  const ready = React.useSyncExternalStore(noSubscription, () => true, () => false);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const message = readMessage<HostMessage>(event, hostSource);
      if (!message) return;
      if (message.type === 'hello') toHost({ type: 'ready' });
      else setPage(message.page);
    };
    window.addEventListener('message', onMessage);
    toHost({ type: 'ready' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const openPage = React.useCallback((next: string) => {
    setPage(next);
    toHost({ type: 'page', page: next });
  }, []);

  return { ready, page, openPage };
}
