'use client';

import { SlidersHorizontal } from 'lucide-react';
import * as React from 'react';
import { choiceParams, type PresetChoice } from '@/lib/presets';
import { Button } from '@/registry/kosmos/ui/button';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/registry/kosmos/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';
import { PresetCodeDialog } from './preset-code-dialog';
import { usePreviewHost } from './preset-frame';
import { PresetPicker } from './preset-picker';
import { presetScreens } from './preset-preview-document';
import { saveSitePreset, useSitePreset } from './site-preset';

type PresetsViewProps = {
  /** The choice the address names, when it names one: a shared link, which becomes the site's preset. */
  sharedChoice: PresetChoice | null;
  runners: Record<string, string>;
  registryAdd: string;
};

/**
 * The Presets page: the site's preset picker beside a preview of components, a dashboard, forms, overlays and the tokens in an iframe. The
 * preset applies to the whole site; the address names it, so a link shares it, and Get code gives it as CSS, a
 * registry command and a DESIGN.md. On a phone the picker opens in a bottom sheet.
 */
export function PresetsView({ sharedChoice, runners, registryAdd }: PresetsViewProps) {
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [screen, setScreen] = React.useState<string>(presetScreens[0].id);
  const [choice] = useSitePreset();
  usePreviewHost(frame, { page: screen, onPage: setScreen });

  React.useEffect(() => {
    if (sharedChoice) saveSitePreset(sharedChoice);
  }, [sharedChoice]);

  React.useEffect(() => {
    const params = choiceParams(choice).toString();
    const search = params ? `?${params}` : '';
    if (search !== window.location.search) window.history.replaceState(null, '', `${window.location.pathname}${search}`);
  }, [choice]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-[40em] flex-col gap-1">
          <h1 className="text-heading">Presets</h1>
          <p className="text-small text-pretty text-muted-foreground">
            Ready palettes and radii for the Kosmos tokens. Pick one and the whole site takes it, with the components,
            dashboard, forms, overlays and tokens below. Then get its code.
          </p>
        </div>
        <div className="flex gap-2">
          <Drawer swipeDirection="down" modal={false}>
            <DrawerTrigger render={<Button variant="secondary" className="lg:hidden" />}>
              <SlidersHorizontal aria-hidden data-icon="inline-start" />
              Preset
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Preset</DrawerTitle>
              </DrawerHeader>
              <DrawerBody className="pb-5"><PresetPicker /></DrawerBody>
            </DrawerContent>
          </Drawer>
          <PresetCodeDialog choice={choice} runners={runners} registryAdd={registryAdd} />
        </div>
      </header>
      <div className="grid min-h-0 gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside aria-label="Preset" className="max-lg:hidden">
          <div className="sticky top-20"><PresetPicker layout="panel" /></div>
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
            {/* The frame fills the screen below the site header, the page title and the tabs, about 14rem. */}
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
