import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Checkbox } from '@/registry/kosmos/ui/checkbox';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import CheckboxGroupExample from './checkbox-group';

const rows = ['unchecked', 'checked', 'indeterminate'] as const;
const states = ['default', 'hover', 'focus', 'invalid', 'disabled'] as const;

function stateProps(state: (typeof states)[number]) {
  if (state === 'invalid') return { 'aria-invalid': true } as const;
  return previewState(state);
}

export default function CheckboxPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Value × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => (
            <Checkbox
              aria-label={`Select row, ${row}, ${state}`}
              defaultChecked={row === 'checked'}
              indeterminate={row === 'indeterminate'}
              {...stateProps(state)}
            />
          )}
        />
      </PreviewSection>

      <PreviewSection title="With a label">
        <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
          <Field orientation="horizontal">
            <Checkbox defaultChecked />
            <FieldLabel>Email me when a task is assigned to me</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox />
            <FieldContent>
              <FieldLabel>Weekly summary</FieldLabel>
              <FieldDescription>A digest of finished tasks, sent every Monday.</FieldDescription>
            </FieldContent>
          </Field>
          <Field orientation="horizontal" invalid>
            <Checkbox />
            <FieldContent>
              <FieldLabel>I accept the terms of service</FieldLabel>
              <FieldError>Accept the terms to create the workspace.</FieldError>
            </FieldContent>
          </Field>
          <Field orientation="horizontal" disabled>
            <Checkbox defaultChecked />
            <FieldContent>
              <FieldLabel>Single sign-on</FieldLabel>
              <FieldDescription>Available on the Business plan.</FieldDescription>
            </FieldContent>
          </Field>
        </div>
      </PreviewSection>

      <PreviewSection title="Group with a parent">
        <CheckboxGroupExample />
      </PreviewSection>

      <PreviewSection title="Long label in a narrow slot">
        <div className="w-56">
          <Field orientation="horizontal">
            <Checkbox defaultChecked />
            <FieldContent>
              <FieldLabel>Notify every member of the workspace when a project is archived or restored</FieldLabel>
              <FieldDescription>Members who muted the project are skipped.</FieldDescription>
            </FieldContent>
          </Field>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
