'use client';

import { Moon, RotateCcw, Sun } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/cn';
import { defaultChoice, presetById, presetPalette, presetRadii, presets, type Mode, type Preset, type PresetChoice } from '@/lib/presets';
import { Button } from '@/registry/kosmos/ui/button';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { Switch } from '@/registry/kosmos/ui/switch';

/** The preset's mark: its accent, or its ink when it has none, in the page's own mode. */
function PresetSwatch({ preset }: { preset: Preset }) {
  const color = (mode: Mode) => (preset.accent ? presetPalette(preset, mode).ring : preset[mode].primary);
  return (
    <span
      aria-hidden
      style={{ '--swatch': color('light'), '--swatch-dark': color('dark') } as React.CSSProperties}
      className="size-3 shrink-0 rounded-full bg-(--swatch) outline outline-1 -outline-offset-1 outline-black/10 dark:bg-(--swatch-dark) dark:outline-white/10"
    />
  );
}

type PresetPickerProps = {
  choice: PresetChoice;
  onChoiceChange: (choice: PresetChoice) => void;
  /** The preview's mode; none until the page knows its own. */
  mode: Mode | undefined;
  onModeChange: (mode: Mode) => void;
  /** Back to the Default preset and the page's mode. */
  onReset: () => void;
  /** `row` for a toolbar over the preview or a phone sheet below it, `panel` for a column beside it. */
  layout?: 'row' | 'panel';
  className?: string;
};

/**
 * The controls of a preset preview: preset, accent, radius, theme and Reset. Picking a preset starts from it as it
 * ships, its accent on and its own radius; the accent and radius then change it.
 */
export function PresetPicker({ choice, onChoiceChange, mode, onModeChange, onReset, layout = 'row', className }: PresetPickerProps) {
  const id = React.useId();
  const preset = presetById(choice.preset);
  const panel = layout === 'panel';
  const control = panel ? 'flex flex-col gap-2' : 'flex items-center gap-2';
  const label = (name: string, text: string) => (
    <span id={`${id}-${name}`} className="text-small text-muted-foreground">
      {text}
    </span>
  );

  return (
    <div
      role="group"
      aria-label="Try a preset"
      className={cn(panel ? 'flex flex-col gap-5' : 'flex flex-wrap items-center gap-x-4 gap-y-2', className)}
    >
      <div className={control}>
        {label('preset', 'Preset')}
        <SegmentedControl
          aria-labelledby={`${id}-preset`}
          value={preset.id}
          onValueChange={(value) => onChoiceChange(defaultChoice(presetById(value)))}
          className={cn(panel && 'w-full flex-col')}
        >
          {presets.map((item) => (
            <SegmentedControlItem key={item.id} value={item.id} className={cn(panel && 'justify-start')}>
              <PresetSwatch preset={item} />
              {/* On a phone the toolbar keeps the swatches only; the names stay for screen readers. */}
              <span className={cn(!panel && 'max-sm:sr-only')}>{item.name}</span>
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        {panel ? (
          <p className="text-small text-pretty text-muted-foreground">{preset.description}</p>
        ) : (
          // The swatches alone don't say which preset is on, so a phone names it beside them.
          <span aria-hidden className="text-small font-medium sm:hidden">
            {preset.name}
          </span>
        )}
      </div>
      <div className={cn('flex items-center gap-2', panel && 'justify-between')}>
        {label('accent', 'Accent')}
        <Switch
          aria-labelledby={`${id}-accent`}
          aria-describedby={preset.accent ? undefined : `${id}-no-accent`}
          checked={choice.accent}
          disabled={!preset.accent}
          onCheckedChange={(accent) => onChoiceChange({ ...choice, accent })}
        />
        {preset.accent ? null : (
          <span id={`${id}-no-accent`} className="sr-only">
            {preset.name} has no accent
          </span>
        )}
      </div>
      <div className={control}>
        {label('radius', 'Radius')}
        <SegmentedControl
          aria-labelledby={`${id}-radius`}
          value={choice.radius}
          onValueChange={(radius) => onChoiceChange({ ...choice, radius })}
          className={cn(panel && 'w-full')}
        >
          {presetRadii.map((value) => (
            <SegmentedControlItem key={value} value={value} aria-label={`${value}px`} className="tabular-nums">
              {value}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
      <div className={control}>
        {label('theme', 'Theme')}
        <SegmentedControl
          aria-labelledby={`${id}-theme`}
          value={mode ?? ''}
          onValueChange={(value) => onModeChange(value === 'dark' ? 'dark' : 'light')}
          className={cn(panel && 'w-full')}
        >
          <SegmentedControlItem value="light" aria-label={panel ? undefined : 'Light'}>
            <Sun aria-hidden data-icon={panel ? 'inline-start' : undefined} />
            {panel ? 'Light' : null}
          </SegmentedControlItem>
          <SegmentedControlItem value="dark" aria-label={panel ? undefined : 'Dark'}>
            <Moon aria-hidden data-icon={panel ? 'inline-start' : undefined} />
            {panel ? 'Dark' : null}
          </SegmentedControlItem>
        </SegmentedControl>
      </div>
      <Button variant={panel ? 'secondary' : 'ghost'} onClick={onReset} className={cn(panel ? 'self-start' : 'max-sm:w-7.5 max-sm:px-0')}>
        <RotateCcw aria-hidden data-icon="inline-start" />
        {/* In the phone toolbar the button shrinks to its icon, so it fits the row beside the theme. */}
        <span className={cn(!panel && 'max-sm:sr-only')}>Reset</span>
      </Button>
    </div>
  );
}
