/*
 * What the landing page and the dashboard document (`/dashboard`, in an iframe on the landing) say to each other
 * through `postMessage`: the landing sets the tokens and the screen, the dashboard reports the page it shows. A preset
 * is the CSS of `lib/presets`; the radii a visitor picks over it are CSS in `app/global.css`, keyed by `data-radius`.
 */
import { defaultPreset } from '@/lib/presets';

/** The dashboard pages the landing's screen tabs switch between, in their order: sidebar item ids. */
export const dashboardScreens = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects' },
  { id: 'roadmap', label: 'Roadmap' },
] as const;

/** The control radius a visitor can try over a preset, in pixels. 10 is the Kosmos `--radius`. */
export const dashboardRadii = ['0', '6', '10', '14'] as const;

export type DashboardRadius = (typeof dashboardRadii)[number];
export type DashboardTheme = 'light' | 'dark';

/** A preset id from `lib/presets`, and a radius over it; no radius keeps the preset's own. */
export type DashboardTokens = { preset: string; radius: DashboardRadius | null; theme?: DashboardTheme };

export const defaultDashboardTokens: DashboardTokens = { preset: defaultPreset.id, radius: null };

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
