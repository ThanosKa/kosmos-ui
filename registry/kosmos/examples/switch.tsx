import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Switch } from '@/registry/kosmos/ui/switch';

const rows = ['off', 'on'] as const;
const states = ['default', 'hover', 'focus', 'invalid', 'disabled'] as const;

function stateProps(state: (typeof states)[number]) {
  if (state === 'invalid') return { 'aria-invalid': true } as const;
  return previewState(state);
}

export default function SwitchPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Value × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => (
            <Switch aria-label={`Notifications, ${row}, ${state}`} defaultChecked={row === 'on'} {...stateProps(state)} />
          )}
        />
      </PreviewSection>

      <PreviewSection title="Settings rows">
        <div className="flex max-w-xl flex-col divide-y divide-border">
          <Field orientation="horizontal" className="py-4 first:pt-0">
            <FieldContent>
              <FieldLabel>Email notifications</FieldLabel>
              <FieldDescription>Get an email when someone assigns you a task.</FieldDescription>
            </FieldContent>
            <Switch defaultChecked />
          </Field>
          <Field orientation="horizontal" className="py-4">
            <FieldContent>
              <FieldLabel>Weekly summary</FieldLabel>
              <FieldDescription>A digest of finished tasks, sent every Monday.</FieldDescription>
            </FieldContent>
            <Switch />
          </Field>
          <Field orientation="horizontal" className="py-4" invalid>
            <FieldContent>
              <FieldLabel>Require two-factor sign-in</FieldLabel>
              <FieldDescription>Every member must set up an authenticator app.</FieldDescription>
              <FieldError>Set up two-factor sign-in for your own profile first.</FieldError>
            </FieldContent>
            <Switch />
          </Field>
          <Field orientation="horizontal" className="py-4 last:pb-0" disabled>
            <FieldContent>
              <FieldLabel>Single sign-on</FieldLabel>
              <FieldDescription>Available on the Scale plan.</FieldDescription>
            </FieldContent>
            <Switch />
          </Field>
        </div>
      </PreviewSection>

      <PreviewSection title="Control first">
        <div className="flex flex-col gap-3">
          <Field orientation="horizontal">
            <Switch defaultChecked />
            <FieldLabel>Show completed tasks</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Switch />
            <FieldLabel>Compact rows</FieldLabel>
          </Field>
        </div>
      </PreviewSection>

      <PreviewSection title="Long label in a narrow slot">
        <div className="w-64">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel>Archive projects with no activity for ninety days or more</FieldLabel>
              <FieldDescription>Archived projects stay searchable and can be restored at any time.</FieldDescription>
            </FieldContent>
            <Switch defaultChecked />
          </Field>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
