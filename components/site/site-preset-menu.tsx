'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { presetById } from '@/lib/presets';
import { Button } from '@/registry/kosmos/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/registry/kosmos/ui/popover';
import { PresetPicker, PresetSwatch } from './preset-picker';
import { useSitePreset } from './site-preset';

/**
 * The header's preset button: it names the site's preset on every page and opens the picker, with Reset and a link
 * to the Presets page. Below 640px it shrinks to the preset's swatch.
 */
export function SitePresetMenu() {
  const [choice] = useSitePreset();
  const preset = presetById(choice.preset);
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="secondary" aria-label={`Preset: ${preset.name}`} className="max-sm:w-7.5 max-sm:px-0" />}
      >
        <PresetSwatch preset={preset} />
        <span aria-hidden className="max-sm:hidden">
          {preset.name}
        </span>
      </PopoverTrigger>
      {/* A fixed width, not `w-72`: in spacing units the popup would resize and jump each time the Size changes. */}
      <PopoverContent align="end" className="w-[18rem]">
        <PresetPicker layout="panel" />
        <Link
          href="/presets"
          className="inline-flex items-center gap-1 self-start rounded-sm text-small font-medium underline decoration-muted-foreground underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Get its code on the Presets page
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
