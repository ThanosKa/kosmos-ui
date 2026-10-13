import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';

export default function InputDisabled() {
  return (
    <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
      <Field disabled>
        <FieldLabel>Workspace ID</FieldLabel>
        <Input defaultValue="ws_8f2k1" />
        <FieldDescription>Only workspace admins can change this.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Invite link</FieldLabel>
        <Input defaultValue="https://acme.example/join/8f2k1" readOnly />
        <FieldDescription>Read-only, so you can still select and copy it.</FieldDescription>
      </Field>
    </div>
  );
}
