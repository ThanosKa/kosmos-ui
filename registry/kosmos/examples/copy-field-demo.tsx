import { CopyField } from '@/registry/kosmos/ui/copy-field';
import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';

export default function CopyFieldDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Field>
        <FieldLabel>Webhook URL</FieldLabel>
        <CopyField label="webhook URL" value="https://hooks.acme.example/v1/fernhill/events" />
      </Field>
      <Field>
        <FieldLabel>Secret key</FieldLabel>
        <CopyField secret label="secret key" value="sk_live_51HxQ2eKd9F4aTq7mWv3Zb8R" />
        <FieldDescription>Keep it on your server. Anyone with this key can send events to Fernhill Books.</FieldDescription>
      </Field>
    </div>
  );
}
