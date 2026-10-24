'use client';

import { SlidersHorizontal } from 'lucide-react';
import * as React from 'react';
import { choiceParams, defaultChoice, type PresetChoice } from '@/lib/presets';
import { Button } from '@/registry/kosmos/ui/button';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/registry/kosmos/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';
import { PresetCodeDialog } from './preset-code-dialog';
import { usePageTheme, usePreviewHost, type PreviewTheme } from './preset-frame';
import { PresetPicker } from './preset-picker';
import { presetScreens } from './preset-preview-document';

type PresetsViewProps = {
  /** The choice and theme the URL opened with. */
  initialChoice: PresetChoice;
  initialTheme: PreviewTheme | null;
  runners: Record<string, string>;
  registryAdd: string;
};

/** The search string of a choice and a theme the visitor picked, so the address opens the same preview. */
function searchOf(choice: PresetChoice, theme: PreviewTheme | null) {
  const params = choiceParams(choice);
  if (theme) params.set('theme', theme);
  const search = params.toString();
  return search ? `?${search}` : '';
}

/**
 * The Presets page: the preset picker beside a preview of components, a dashboard and forms in an iframe, which
 * takes the preset on its own document so the site around it never changes. The choice lives in the address, and
 * Get code gives it as CSS, a registry command and a DESIGN.md. On a phone the picker opens in a bottom sheet.
 */
export function PresetsView({ initialChoice, initialTheme, runners, registryAdd }: PresetsViewProps) {
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [screen, setScreen] = React.useState<string>(presetScreens[0].id);
  const [choice, setChoice] = React.useState(initialChoice);
  const [themeChoice, setThemeChoice] = React.useState(initialTheme);
  const pageTheme = usePageTheme();
  const theme = themeChoice ?? pageTheme;
  const tokens = React.useMemo(() => (theme ? { choice, theme } : null), [choice, theme]);
  usePreviewHost(frame, { tokens, page: screen, onPage: setScreen });

  React.useEffect(() => {
    const search = searchOf(choice, themeChoice);
    if (search !== window.location.search) window.history.replaceState(null, '', `${window.location.pathname}${search}`);
  }, [choice, themeChoice]);

  const picker = (
    <PresetPicker
      layout="panel"
      choice={choice}
      onChoiceChange={setChoice}
      theme={theme}
      onThemeChange={setThemeChoice}
      onReset={() => {
        setChoice(defaultChoice());
        setThemeChoice(null);
      }}
    />
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-[40em] flex-col gap-1">
          <h1 className="text-heading">Presets</h1>
          <p className="text-small text-pretty text-muted-foreground">
            Ready palettes and radii for the Kosmos tokens. Pick one and watch components, a dashboard and forms take
            it, then get its code.
          </p>
        </div>
        <div className="flex gap-2">
          <Drawer swipeDirection="down" modal={false}>
            <DrawerTrigger render={<Button variant="secondary" className="lg:hidden" />}>
              <SlidersHorizontal aria-hidden data-icon="inline-start" />
              Customize
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Customize</DrawerTitle>
              </DrawerHeader>
              <DrawerBody className="pb-5">{picker}</DrawerBody>
            </DrawerContent>
          </Drawer>
          <PresetCodeDialog choice={choice} runners={runners} registryAdd={registryAdd} />
        </div>
      </header>
      <div className="grid min-h-0 gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside aria-label="Preset" className="max-lg:hidden">
          <div className="sticky top-20">{picker}</div>
        </aside>
        <Tabs value={screen} onValueChange={(value) => setScreen(String(value))} className="min-w-0 gap-3">
          <TabsList aria-label="Preview">
            {presetScreens.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* One panel for every tab: the screens are pages of one document in the frame, which keeps its state. */}
          <TabsContent value={screen} keepMounted>
            <iframe
              ref={frame}
              src="/preset-preview"
              title="Preview of the preset"
              className="block h-[calc(100svh-14rem)] min-h-[32rem] w-full rounded-2xl border border-transparent bg-background shadow-card"
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
