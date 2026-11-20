'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { isEmail } from '@/registry/kosmos/lib/tags';
import { Field, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { TagsInput } from '@/registry/kosmos/ui/tags-input';
import { DataSetPreview } from '@/components/preview/data-set-preview';

const rows = ['placeholder', 'tags', 'mistyped tag'] as const;
const states = ['default', 'focus', 'invalid', 'invalid focus', 'disabled', 'read-only'] as const;

const tagsFor: Record<(typeof rows)[number], string[]> = {
  placeholder: [],
  tags: ['tomas@acme.example', 'ama@acme.example'],
  'mistyped tag': ['kai@acme.example', 'lena@acme'],
};

function stateProps(state: (typeof states)[number]) {
  if (state === 'invalid') return { 'aria-invalid': true } as const;
  if (state === 'invalid focus') return { 'aria-invalid': true, 'data-preview': 'focus' } as const;
  if (state === 'disabled') return { disabled: true } as const;
  if (state === 'read-only') return { readOnly: true } as const;
  return previewState(state);
}

const team = ['lena@acme.example', 'tomas@acme.example', 'ama@acme.example', 'kai@acme.example'];

const many = [
  'lena@acme.example',
  'tomas@acme.example',
  'ama@acme.example',
  'kai@acme.example',
  'billing@fernhill.example',
  'ops@brightloop.example',
  'data@copperline.example',
  'hello@saltmarsh.example',
  'mobile@cirrus.example',
  'ラーメン@marigold.example',
  'σοφία@tidepool.example',
];

function Normal() {
  return (
    <>
      <PreviewSection title="Field × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => (
            <TagsInput
              aria-label={`Invite, ${row}, ${state}`}
              defaultValue={tagsFor[row]}
              validate={isEmail}
              placeholder="name@acme.example"
              {...stateProps(state)}
            />
          )}
        />
      </PreviewSection>

      <PreviewSection title="In a field, with suggestions and a limit">
        <div className="grid gap-6 md:grid-cols-3">
          <Field invalid>
            <FieldLabel>Invite by email</FieldLabel>
            <TagsInput defaultValue={['kai@acme.example', 'ama@acme']} validate={isEmail} delimiters={[',', ';', ' ']} />
            <FieldError>Fix or remove ama@acme: an address ends in a domain, such as acme.example.</FieldError>
          </Field>
          <Field>
            <FieldLabel>Send the weekly summary to</FieldLabel>
            <TagsInput suggestions={team} defaultValue={['lena@acme.example']} placeholder="name@acme.example" />
          </Field>
          <Field>
            <FieldLabel>Labels, 3 at most</FieldLabel>
            <TagsInput defaultValue={['mobile', 'storm traffic', 'case study']} max={3} placeholder="Add a label" />
          </Field>
        </div>
      </PreviewSection>

    </>
  );
}

const worstTags = [
  ...many,
  'bartholomew.fitzgerald@northwind-industries-holdings.example',
  'jo@a.example',
  '🌊saltmarsh@example',
  'quarterly-revenue-forecast-every-region-and-plan@copperline.example',
  ...Array.from({ length: 24 }, (_, index) => `member-${index + 1}@acme.example`),
];

function Worst() {
  return (
    <>
      <PreviewSection title="Forty tags, long and non-Latin, with a mistyped one">
        <div className="flex max-w-md flex-col gap-4">
          <TagsInput aria-label="Invite, many" defaultValue={worstTags} validate={isEmail} />
          <TagsInput aria-label="Invite, one long address" defaultValue={['quarterly-revenue-forecast-every-region-and-plan@copperline.example']} />
        </div>
      </PreviewSection>

      <PreviewSection title="In a narrow field, at the limit">
        <div className="flex w-56 flex-col gap-4">
          <TagsInput aria-label="Labels at the limit" defaultValue={['Ιστότοπος καφέ', 'storm traffic and seasonal promotions', 'K']} max={3} />
        </div>
      </PreviewSection>
    </>
  );
}

export default function TagsInputPreview() {
  return (
    <DataSetPreview
      demo={
        <PreviewStack>
          <Normal />
        </PreviewStack>
      }
      worst={
        <PreviewStack>
          <Worst />
        </PreviewStack>
      }
    />
  );
}
