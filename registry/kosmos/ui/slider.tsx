'use client';

import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type SliderProps = Omit<SliderPrimitive.Root.Props, 'className'> &
  Pick<SliderPrimitive.Thumb.Props, 'getAriaLabel' | 'getAriaValueText'> & {
    className?: string;
    /** Names the thumb of a slider with no visible label. A range slider names each thumb with `getAriaLabel`. */
    'aria-label'?: string;
  };

/**
 * Picks a number, or a range with two values, by dragging a thumb along a track or with the
 * arrow keys. One thumb renders per value. Put a `SliderLabel` and a `SliderValue` inside to
 * show a label and the current value above the track.
 */
function Slider({
  className,
  children,
  value,
  defaultValue,
  min = 0,
  max = 100,
  getAriaLabel,
  getAriaValueText,
  'aria-label': ariaLabel,
  ...props
}: SliderProps) {
  const values = React.useMemo(() => {
    const current = value ?? defaultValue ?? min;
    return Array.isArray(current) ? current : [current];
  }, [value, defaultValue, min]);

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      thumbAlignment="edge"
      className={cn(
        'flex w-full flex-col gap-1 data-disabled:opacity-50',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:items-center',
        className,
      )}
      {...props}
    >
      {children}
      <SliderPrimitive.Control
        data-slot="slider-control"
        className={cn(
          // The control is the press target: 24px tall around the 6px track.
          'relative flex w-full touch-none items-center py-2.25 select-none data-disabled:cursor-not-allowed',
          'data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:px-2.25 data-[orientation=vertical]:py-0',
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            'relative h-1.5 w-full grow rounded-full border border-transparent bg-muted shadow-inset',
            'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-indicator"
            className="rounded-full bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          />
          {values.map((_, index) => (
            <SliderPrimitive.Thumb
              // Thumbs are positional: index i always holds value i.
              key={index}
              index={index}
              data-slot="slider-thumb"
              aria-label={values.length === 1 ? ariaLabel : undefined}
              getAriaLabel={getAriaLabel}
              getAriaValueText={getAriaValueText}
              className={cn(
                'block size-4 rounded-full border border-transparent bg-thumb shadow-thumb',
                // A 28px hit area around the 16px thumb.
                'after:absolute after:-inset-1.5 after:rounded-full',
                'transition-[box-shadow]',
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
                'data-invalid:ring-1 data-invalid:ring-destructive',
                'data-disabled:cursor-not-allowed',
              )}
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

type SliderLabelProps = Omit<SliderPrimitive.Label.Props, 'className'> & { className?: string };

/** The slider's visible name, read with each thumb. Put it inside `Slider`. */
function SliderLabel({ className, ...props }: SliderLabelProps) {
  return (
    <SliderPrimitive.Label
      data-slot="slider-label"
      className={cn('w-fit text-body font-medium text-foreground', className)}
      {...props}
    />
  );
}

type SliderValueProps = Omit<SliderPrimitive.Value.Props, 'className'> & { className?: string };

/** The current value, formatted with the slider's `format`. Put it inside `Slider`. */
function SliderValue({ className, ...props }: SliderValueProps) {
  return (
    <SliderPrimitive.Value
      data-slot="slider-value"
      className={cn('text-body text-muted-foreground tabular-nums', className)}
      {...props}
    />
  );
}

export { Slider, SliderLabel, SliderValue, type SliderLabelProps, type SliderProps, type SliderValueProps };
