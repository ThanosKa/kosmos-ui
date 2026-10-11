import { Field, FieldContent, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { Switch } from '@/registry/kosmos/ui/switch';

export default function SwitchSettings() {
  return (
    <div className="flex w-full max-w-lg flex-col divide-y divide-border">
      <Field name="email-notifications" orientation="horizontal" className="pb-4">
        <FieldContent>
          <FieldLabel>Email notifications</FieldLabel>
          <FieldDescription>Get an email when someone assigns you a task.</FieldDescription>
        </FieldContent>
        <Switch defaultChecked />
      </Field>
      <Field name="weekly-summary" orientation="horizontal" className="py-4">
        <FieldContent>
          <FieldLabel>Weekly summary</FieldLabel>
          <FieldDescription>A digest of finished tasks, sent every Monday.</FieldDescription>
        </FieldContent>
        <Switch />
      </Field>
      <Field name="sso" orientation="horizontal" disabled className="pt-4">
        <FieldContent>
          <FieldLabel>Single sign-on</FieldLabel>
          <FieldDescription>Available on the Business plan.</FieldDescription>
        </FieldContent>
        <Switch />
      </Field>
    </div>
  );
}
