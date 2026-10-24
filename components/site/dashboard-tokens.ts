/*
 * What the landing page and the dashboard document (`/dashboard`, in an iframe on the landing) say to each other
 * through `postMessage`: the landing sets the tokens and the screen, the dashboard reports the page it shows. The
 * values of each accent and radius are CSS in `app/global.css`, keyed by `data-accent` and `data-radius`.
 */

/** The dashboard pages the landing's screen tabs switch between, in their order: sidebar item ids. */
export const dashboardScreens = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects' },
  { id: 'roadmap', label: 'Roadmap' },
] as const;

/** The accents a visitor can try. The first is the Kosmos ink, no accent at all, which the dashboard starts in. */
export const dashboardAccents = [
  { id: 'ink', label: 'Ink' },
  { id: 'violet', label: 'Violet' },
  { id: 'magenta', label: 'Magenta' },
  { id: 'teal', label: 'Teal' },
] as const;

/** The control radius a visitor can try, in pixels. 10 is the Kosmos `--radius`. */
export const dashboardRadii = ['0', '6', '10', '14'] as const;

export type DashboardAccent = (typeof dashboardAccents)[number]['id'];
export type DashboardRadius = (typeof dashboardRadii)[number];
export type DashboardTheme = 'light' | 'dark';

export type DashboardTokens = { accent: DashboardAccent; radius: DashboardRadius; theme?: DashboardTheme };

export const defaultDashboardTokens: DashboardTokens = { accent: 'ink', radius: '10' };

export const landingSource = 'kosmos-landing';
export const dashboardSource = 'kosmos-dashboard';

export type LandingMessage =
  | { source: typeof landingSource; type: 'hello' }
  | { source: typeof landingSource; type: 'tokens'; tokens: DashboardTokens }
  | { source: typeof landingSource; type: 'page'; page: string };

export type DashboardMessage = { source: typeof dashboardSource; type: 'ready' } | { source: typeof dashboardSource; type: 'page'; page: string };

type Payload<M> = M extends unknown ? Omit<M, 'source'> : never;

export function toDashboard(frame: HTMLIFrameElement | null, message: Payload<LandingMessage>) {
  frame?.contentWindow?.postMessage({ source: landingSource, ...message }, window.location.origin);
}

export function toLanding(message: Payload<DashboardMessage>) {
  window.parent.postMessage({ source: dashboardSource, ...message }, window.location.origin);
}

/** The message, when it comes from the same origin and the expected side. */
export function readMessage<M extends LandingMessage | DashboardMessage>(event: MessageEvent, from: M['source']): M | null {
  if (event.origin !== window.location.origin) return null;
  const data = event.data as { source?: unknown } | null;
  return data && typeof data === 'object' && data.source === from ? (data as M) : null;
}
