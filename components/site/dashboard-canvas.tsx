'use client';

import { Moon, RotateCcw, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';
import {
  dashboardAccents,
  dashboardScreens,
  dashboardRadii,
  dashboardSource,
  defaultDashboardTokens,
  readMessage,
  toDashboard,
  type DashboardAccent,
  type DashboardMessage,
  type DashboardRadius,
  type DashboardTheme,
} from './dashboard-tokens';

const noSubscription = () => () => {};

/** A visible name for a control, which the control takes as its accessible name. */
function ControlLabel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span id={id} className="text-small text-muted-foreground">
      {children}
    </span>
  );
}

/**
 * The landing page's dashboard: the Parallax app in an iframe, with tabs for its main screens and the accent, radius
 * and theme a visitor can try on it. The tokens apply inside the iframe's document, so the page around it never changes;
 * Reset brings back the Kosmos defaults and the page's theme.
 */
export function DashboardCanvas() {
  const frame = React.useRef<HTMLIFrameElement>(null);
  // Counts the dashboard's loads: each fresh document starts on Overview with the Kosmos defaults and needs the screen and tokens sent again.
  const [loads, setLoads] = React.useState(0);
  const [screen, setScreen] = React.useState<string>(dashboardScreens[0].id);
  const [accent, setAccent] = React.useState<DashboardAccent>(defaultDashboardTokens.accent);
  const [radius, setRadius] = React.useState<DashboardRadius>(defaultDashboardTokens.radius);
  const [themeChoice, setThemeChoice] = React.useState<DashboardTheme | null>(null);
  const { resolvedTheme } = useTheme();
  // The server can't know the stored theme, so the page theme counts only once hydrated.
  const hydrated = React.useSyncExternalStore(noSubscription, () => true, () => false);
  const pageTheme = hydrated && (resolvedTheme === 'dark' || resolvedTheme === 'light') ? resolvedTheme : undefined;
  const theme = themeChoice ?? pageTheme;
  const id = React.useId();

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const message = readMessage<DashboardMessage>(event, dashboardSource);
      if (message?.type === 'ready') setLoads((count) => count + 1);
      else if (message?.type === 'page') setScreen(message.page);
    };
    window.addEventListener('message', onMessage);
    // The dashboard may have loaded before this page hydrated, and its first "ready" went unheard.
    toDashboard(frame.current, { type: 'hello' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  React.useEffect(() => {
    if (loads > 0 && theme) toDashboard(frame.current, { type: 'tokens', tokens: { accent, radius, theme } });
  }, [loads, accent, radius, theme]);

  // The tabs lead: a "ready" can arrive after a tab was chosen (the reply to "hello"), so each load is sent the screen.
  React.useEffect(() => {
    if (loads > 0) toDashboard(frame.current, { type: 'page', page: screen });
  }, [loads, screen]);

  const reset = () => {
    setAccent(defaultDashboardTokens.accent);
    setRadius(defaultDashboardTokens.radius);
    setThemeChoice(null);
  };

  return (
    <Tabs value={screen} onValueChange={(value) => setScreen(String(value))} className="gap-3">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <TabsList aria-label="Dashboard screens">
          {dashboardScreens.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div role="group" aria-label="Try other tokens" className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-0.5">
          <div className="flex items-center gap-2">
            <ControlLabel id={`${id}-accent`}>Accent</ControlLabel>
            <SegmentedControl aria-labelledby={`${id}-accent`} value={accent} onValueChange={(value) => setAccent(value as DashboardAccent)}>
              {dashboardAccents.map((item) => (
                <SegmentedControlItem key={item.id} value={item.id} aria-label={item.label}>
                  <span aria-hidden data-accent={item.id} className="size-3 rounded-full bg-ring" />
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>
          <div className="flex items-center gap-2">
            <ControlLabel id={`${id}-radius`}>Radius</ControlLabel>
            <SegmentedControl aria-labelledby={`${id}-radius`} value={radius} onValueChange={(value) => setRadius(value as DashboardRadius)}>
              {dashboardRadii.map((value) => (
                <SegmentedControlItem key={value} value={value} aria-label={`${value}px`} className="tabular-nums">
                  {value}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>
          <div className="flex items-center gap-2">
            <ControlLabel id={`${id}-theme`}>Theme</ControlLabel>
            <SegmentedControl
              aria-labelledby={`${id}-theme`}
              value={theme ?? ''}
              onValueChange={(value) => setThemeChoice(value as DashboardTheme)}
            >
              <SegmentedControlItem value="light" aria-label="Light">
                <Sun aria-hidden />
              </SegmentedControlItem>
              <SegmentedControlItem value="dark" aria-label="Dark">
                <Moon aria-hidden />
              </SegmentedControlItem>
            </SegmentedControl>
          </div>
          <Button variant="ghost" onClick={reset} className="max-sm:w-7.5 max-sm:px-0">
            <RotateCcw aria-hidden data-icon="inline-start" />
            {/* On a phone the button shrinks to its icon, so it fits the row beside the theme. */}
            <span className="max-sm:sr-only">Reset</span>
          </Button>
        </div>
      </div>
      {/* One panel for every screen: the screens are pages of the one app in the frame, which keeps its state. */}
      <TabsContent value={screen} keepMounted>
        <iframe
          ref={frame}
          src="/dashboard"
          title="Parallax, a demo dashboard built from Kosmos blocks"
          className="block h-[40rem] w-full rounded-2xl border border-transparent bg-background shadow-card md:h-[50rem]"
        />
      </TabsContent>
    </Tabs>
  );
}
