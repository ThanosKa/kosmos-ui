import { Field, FieldContent, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { NumberField } from '@/registry/kosmos/ui/number-field';

export default function NumberFieldSettings() {
  return (
    <div className="flex w-full max-w-lg flex-col divide-y divide-border">
      <Field name="session-timeout" orientation="horizontal" className="pb-4">
        <FieldContent>
          <FieldLabel>Session timeout</FieldLabel>
          <FieldDescription>Minutes of inactivity before members sign in again.</FieldDescription>
        </FieldContent>
        <NumberField defaultValue={30} min={5} max={720} step={5} locale="en-US" className="w-32" />
      </Field>
      <Field name="alert-threshold" orientation="horizontal" className="pt-4">
        <FieldContent>
          <FieldLabel>Signups alert</FieldLabel>
          <FieldDescription>Email the team when a day has fewer signups than this.</FieldDescription>
        </FieldContent>
        <NumberField defaultValue={40} min={0} locale="en-US" className="w-32" />
      </Field>
    </div>
  );
}
