'use client';

import * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix } from '@/components/preview/state-matrix';
import { Button } from '@/registry/kosmos/ui/button';
import { Field, FieldLabel } from '@/registry/kosmos/ui/field';
import { NumberField, type NumberFieldProps } from '@/registry/kosmos/ui/number-field';
import NumberFieldDemo from './number-field-demo';
import NumberFieldFormat from './number-field-format';
import NumberFieldInvalid from './number-field-invalid';
import NumberFieldSettings from './number-field-settings';

const rows = ['empty', 'value', 'at min', 'currency'] as const;
const states = ['default', 'hover', 'active', 'focus', 'invalid', 'disabled', 'read-only'] as const;

const rowProps: Record<(typeof rows)[number], NumberFieldProps> = {
  empty: { placeholder: 'None', min: 0 },
  value: { defaultValue: 12, min: 0 },
  'at min': { defaultValue: 0, min: 0 },
  currency: { defaultValue: 1200, min: 0, step: 100, format: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 } },
};

/** Pins a state on a part the NumberField does not expose: the input for focus, the plus button for hover and press. */
function PinPart({ state, children }: { state: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const selector = state === 'focus' ? '[data-slot="number-field-input"]' : '[data-slot="number-field-increment"]';
    ref.current?.querySelector(selector)?.setAttribute('data-preview', state);
  }, [state]);
  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}

export default function NumberFieldPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Values × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => {
            const field = (
              <Field invalid={state === 'invalid'} disabled={state === 'disabled'}>
                <NumberField
                  aria-label={`Seats, ${row}, ${state}`}
                  locale="en-US"
                  readOnly={state === 'read-only'}
                  className="w-full"
                  {...rowProps[row]}
                />
              </Field>
            );
            return state === 'hover' || state === 'active' || state === 'focus' ? <PinPart state={state}>{field}</PinPart> : field;
          }}
        />
      </PreviewSection>

      <PreviewSection title="In a field">
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
          <NumberFieldDemo />
          <NumberFieldInvalid />
        </div>
      </PreviewSection>

      <PreviewSection title="Formats">
        <NumberFieldFormat />
      </PreviewSection>

      <PreviewSection title="In a settings row">
        <NumberFieldSettings />
      </PreviewSection>

      <PreviewSection title="Beside a button, at its height">
        <div className="flex flex-wrap items-center gap-2">
          <NumberField aria-label="Rows per page" defaultValue={25} min={10} max={100} step={5} locale="en-US" className="h-7.5 w-28" />
          <Button variant="secondary">Apply</Button>
        </div>
      </PreviewSection>

      <PreviewSection title="Long values and a long label">
        <div className="grid gap-6 sm:grid-cols-3">
          <Field>
            <FieldLabel>Events this month</FieldLabel>
            <NumberField defaultValue={28495200} min={0} step={1000} locale="en-US" className="w-48" />
          </Field>
          <Field>
            <FieldLabel>Lowest balance</FieldLabel>
            <NumberField
              defaultValue={-1250.5}
              format={{ style: 'currency', currency: 'USD' }}
              locale="en-US"
              className="w-48"
            />
          </Field>
          <Field>
            <FieldLabel>Sampling rate for every event a project sends while it is on a trial</FieldLabel>
            <NumberField defaultValue={0.125} min={0} max={1} step={0.005} format={{ style: 'percent', maximumFractionDigits: 1 }} locale="en-US" />
          </Field>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
