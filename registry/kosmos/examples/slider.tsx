'use client';

import * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix } from '@/components/preview/state-matrix';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Slider, SliderLabel, SliderValue } from '@/registry/kosmos/ui/slider';

const rows = ['single', 'range'] as const;
const states = ['default', 'hover', 'focus', 'invalid', 'disabled'] as const;

/** Pins focus on the first thumb: focus sits on the range input inside it, which the Slider does not expose. */
function PinThumbFocus({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.querySelector('input[type="range"]')?.setAttribute('data-preview', 'focus');
  }, []);
  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}

const rangeLabel = (index: number) => (index === 0 ? 'Minimum volume' : 'Maximum volume');
const thresholdLabel = (index: number) => (index === 0 ? 'Minimum threshold' : 'Maximum threshold');
const spendLabel = (index: number) => (index === 0 ? 'Minimum monthly spend' : 'Maximum monthly spend');
const bandLabel = (index: number) => (index === 0 ? 'Lowest frequency' : 'Highest frequency');

export default function SliderPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Values × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => {
            const slider = (
              <Field invalid={state === 'invalid'} disabled={state === 'disabled'} className="w-full">
                <Slider
                  aria-label={`Volume, ${state}`}
                  getAriaLabel={row === 'range' ? rangeLabel : undefined}
                  defaultValue={row === 'range' ? [25, 75] : 40}
                  data-preview={state === 'hover' ? 'hover' : undefined}
                />
              </Field>
            );
            return state === 'focus' ? <PinThumbFocus>{slider}</PinThumbFocus> : slider;
          }}
        />
      </PreviewSection>

      <PreviewSection title="With a label and value">
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
          <Slider defaultValue={60}>
            <div className="flex items-center justify-between gap-4">
              <SliderLabel>Volume</SliderLabel>
              <SliderValue />
            </div>
          </Slider>
          <Slider
            defaultValue={[0.2, 0.8]}
            min={0}
            max={1}
            step={0.01}
            format={{ style: 'percent' }}
            getAriaLabel={thresholdLabel}
          >
            <div className="flex items-center justify-between gap-4">
              <SliderLabel>Scaling threshold</SliderLabel>
              <SliderValue />
            </div>
          </Slider>
        </div>
      </PreviewSection>

      <PreviewSection title="In a field">
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
          <Field>
            <FieldLabel nativeLabel={false} render={<div />}>
              Seats
            </FieldLabel>
            <Slider defaultValue={12} min={1} max={50} />
            <FieldDescription>Each seat is billed monthly.</FieldDescription>
          </Field>
          <Field invalid>
            <FieldLabel nativeLabel={false} render={<div />}>
              Daily budget
            </FieldLabel>
            <Slider defaultValue={90} step={10} format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }} />
            <FieldError>Your plan allows up to €80 a day.</FieldError>
          </Field>
        </div>
      </PreviewSection>

      <PreviewSection title="Vertical">
        <div className="flex h-40 gap-8">
          <Slider orientation="vertical" aria-label="Bass" defaultValue={30} />
          <Slider orientation="vertical" aria-label="Treble" defaultValue={70} />
          <Slider orientation="vertical" getAriaLabel={bandLabel} defaultValue={[20, 60]} />
        </div>
      </PreviewSection>

      <PreviewSection title="Long label in a narrow slot">
        <div className="w-56">
          <Slider defaultValue={[1200, 4800]} min={0} max={10000} step={100} getAriaLabel={spendLabel}>
            <div className="flex items-start justify-between gap-3">
              <SliderLabel>Monthly spend across every workspace</SliderLabel>
              <SliderValue className="shrink-0" />
            </div>
          </Slider>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
