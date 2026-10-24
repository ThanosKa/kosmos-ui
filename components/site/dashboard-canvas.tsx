'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';
import { usePresetPreview } from './preset-frame';
import { PresetPicker } from './preset-picker';

/** The dashboard pages the screen tabs switch between, in their order: sidebar item ids. */
const dashboardScreens = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects' },
  { id: 'roadmap', label: 'Roadmap' },
] as const;

/**
 * The landing page's dashboard: the Acme app in an iframe, with tabs for its main screens and the preset picker. The
 * preset applies inside the iframe's document, so the page around it never changes; Reset brings back the Default
 * preset and the page's theme.
 */
export function DashboardCanvas() {
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [screen, setScreen] = React.useState<string>(dashboardScreens[0].id);
  const { choice, setChoice, mode, setMode, reset } = usePresetPreview(frame, { page: screen, onPage: setScreen });

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
        <PresetPicker
          choice={choice}
          onChoiceChange={setChoice}
          mode={mode}
          onModeChange={setMode}
          onReset={reset}
          className="pb-0.5"
        />
      </div>
      {/* One panel for every screen: the screens are pages of the one app in the frame, which keeps its state. */}
      <TabsContent value={screen} keepMounted>
        <iframe
          ref={frame}
          src="/dashboard"
          title="Acme, a demo dashboard built from Kosmos blocks"
          className="block h-[40rem] w-full rounded-2xl border border-transparent bg-background shadow-card md:h-[50rem]"
        />
      </TabsContent>
    </Tabs>
  );
}
