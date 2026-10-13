import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { OtpField, OtpFieldInput, OtpFieldSeparator } from '@/registry/kosmos/ui/otp-field';

const rows = ['empty', 'partly filled', 'filled'] as const;
const states = ['default', 'focus', 'invalid', 'invalid focus', 'disabled'] as const;
const values = { empty: '', 'partly filled': '42', filled: '424242' } satisfies Record<(typeof rows)[number], string>;

function Boxes({ state }: { state: (typeof states)[number] }) {
  return Array.from({ length: 6 }, (_, index) => (
    <OtpFieldInput
      key={index}
      aria-label={index === 0 ? undefined : `Character ${index + 1} of 6`}
      data-preview={state.endsWith('focus') && index === 0 ? 'focus' : undefined}
    />
  ));
}

export default function OtpFieldPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Content × states">
        <div data-state-matrix className="flex w-full flex-col divide-y divide-border">
          {rows.map((row) => (
            <div key={row} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
              <p className="font-mono text-caption text-muted-foreground">{row}</p>
              <ul className="grid gap-x-8 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
                {states.map((state) => (
                  <li key={state} data-state={state} className="flex flex-col items-start gap-2">
                    <Field invalid={state.startsWith('invalid')}>
                      <FieldLabel className="text-caption font-normal text-muted-foreground">{state}</FieldLabel>
                      <OtpField length={6} defaultValue={values[row]} disabled={state === 'disabled'}>
                        <Boxes state={state} />
                      </OtpField>
                    </Field>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="In a field">
        <div className="flex flex-wrap gap-10">
          <Field>
            <FieldLabel>Verification code</FieldLabel>
            <OtpField />
            <FieldDescription>We sent it to lena@parallax.example.</FieldDescription>
          </Field>
          <Field invalid>
            <FieldLabel>Verification code</FieldLabel>
            <OtpField defaultValue="424241" />
            <FieldError>That code is wrong or has expired.</FieldError>
          </Field>
        </div>
      </PreviewSection>

      <PreviewSection title="Groups and lengths">
        <div className="flex flex-col gap-6">
          <Field>
            <FieldLabel>Six digits in two groups</FieldLabel>
            <OtpField groupSize={3} defaultValue="424" />
          </Field>
          <Field>
            <FieldLabel>Four digits</FieldLabel>
            <OtpField length={4} defaultValue="2026" />
          </Field>
          <Field>
            <FieldLabel>Eight letters and digits</FieldLabel>
            <OtpField length={8} groupSize={4} validationType="alphanumeric" defaultValue="PX7KQ2" />
          </Field>
          <Field>
            <FieldLabel>Masked</FieldLabel>
            <OtpField length={4} mask defaultValue="2026" />
          </Field>
          <Field>
            <FieldLabel>Custom boxes</FieldLabel>
            <OtpField length={4}>
              <OtpFieldInput />
              <OtpFieldInput aria-label="Character 2 of 4" />
              <OtpFieldSeparator />
              <OtpFieldInput aria-label="Character 3 of 4" />
              <OtpFieldInput aria-label="Character 4 of 4" />
            </OtpField>
          </Field>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
