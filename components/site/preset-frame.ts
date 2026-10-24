'use client';

/*
 * How a site page shows a preset in a preview iframe (the landing's dashboard, the Presets page): the page sends the
 * choice, the theme and the screen through `postMessage`, and the document in the frame writes the preset's CSS on
 * its own root, so its portals take the preset and the page around it never changes. The frame reports the screen
 * a visitor opens inside it.
 */
import { useTheme } from 'next-themes';
import * as React from 'react';
import { choiceParams, chosenPreset, defaultChoice, presetCss, type Mode, type PresetChoice } from '@/lib/presets';

/** What the preview shows: the preset choice, in light or dark. */
export type PreviewState = { choice: PresetChoice; mode: Mode };

const hostSource = 'kosmos-site';
const frameSource = 'kosmos-preview';

type HostMessage =
  | { source: typeof hostSource; type: 'hello' }
  | { source: typeof hostSource; type: 'state'; state: PreviewState }
  | { source: typeof hostSource; type: 'page'; page: string };

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

const noSubscription = () => () => {};

/** The site page's own mode, once hydrated: the server can't know the stored theme. */
function usePageMode(): Mode | undefined {
  const { resolvedTheme } = useTheme();
  const hydrated = React.useSyncExternalStore(noSubscription, () => true, () => false);
  return hydrated && (resolvedTheme === 'dark' || resolvedTheme === 'light') ? resolvedTheme : undefined;
}

type PresetPreviewOptions = {
  /** The screen the frame shows; screens a visitor opens inside the frame come back through `onPage`. */
  page: string;
  onPage: (page: string) => void;
  initialChoice?: PresetChoice;
  /** A mode picked before, such as one in the address; none follows the page. */
  initialMode?: Mode | null;
};

/**
 * The page side of a preset preview: the choice and the mode a visitor picks, sent with the screen to the frame
 * each time one changes or the frame loads again. Until the visitor picks a mode the preview follows the page's own.
 */
export function usePresetPreview(
  frame: React.RefObject<HTMLIFrameElement | null>,
  { page, onPage, initialChoice = defaultChoice(), initialMode = null }: PresetPreviewOptions,
) {
  const [choice, setChoice] = React.useState(initialChoice);
  const [pickedMode, setPickedMode] = React.useState(initialMode);
  const pageMode = usePageMode();
  const mode = pickedMode ?? pageMode;
  const state = React.useMemo(() => (mode ? { choice, mode } : null), [choice, mode]);
  // Counts the frame's loads: each fresh document starts on its first screen with the Kosmos defaults and needs both again.
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

  React.useEffect(() => {
    if (loads > 0 && state) toFrame(frame.current, { type: 'state', state });
  }, [frame, loads, state]);

  // The page leads: a "ready" can arrive after a screen was chosen (the reply to "hello"), so each load is sent the screen.
  React.useEffect(() => {
    if (loads > 0) toFrame(frame.current, { type: 'page', page });
  }, [frame, loads, page]);

  const reset = React.useCallback(() => {
    setChoice(defaultChoice());
    setPickedMode(null);
  }, []);

  return { choice, setChoice, mode, pickedMode, setMode: setPickedMode, reset };
}

/**
 * The frame side: the state and the screen the page sends. Until the first state arrives the document keeps the
 * Kosmos defaults and the stored site theme; after that it writes the chosen preset's CSS on its root.
 */
export function usePreviewFrame(firstPage: string) {
  const [state, setState] = React.useState<PreviewState | null>(null);
  const [page, setPage] = React.useState(firstPage);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const message = readMessage<HostMessage>(event, hostSource);
      if (!message) return;
      if (message.type === 'hello') toHost({ type: 'ready' });
      else if (message.type === 'state') setState(message.state);
      else setPage(message.page);
    };
    window.addEventListener('message', onMessage);
    toHost({ type: 'ready' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // The tokens already hold the Default preset as it ships, so it needs no CSS of its own.
  const css = state && choiceParams(state.choice).size > 0 ? presetCss(chosenPreset(state.choice)) : '';
  React.useEffect(() => {
    if (state) withoutTransitions(() => (presetStyle().textContent = css));
  }, [state, css]);

  const openPage = React.useCallback((next: string) => {
    setPage(next);
    toHost({ type: 'page', page: next });
  }, []);

  return { state, page, openPage };
}

/** The style element that holds the preset's CSS, after the tokens so it wins over them. */
function presetStyle() {
  const existing = document.getElementById('preview-preset');
  if (existing) return existing;
  const style = document.createElement('style');
  style.id = 'preview-preset';
  document.head.appendChild(style);
  return style;
}

/** Applies a preset change in one frame, as `disableTransitionOnChange` does for the theme. */
function withoutTransitions(change: () => void) {
  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{transition:none!important}';
  document.head.appendChild(style);
  change();
  // Reading a computed style flushes the change before the override is removed.
  window.getComputedStyle(document.body).transition;
  requestAnimationFrame(() => style.remove());
}
