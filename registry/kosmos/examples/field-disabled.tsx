import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';

export default function FieldDisabled() {
  return (
    <Field disabled className="w-full max-w-xs">
      <FieldLabel>Workspace URL</FieldLabel>
      <Input defaultValue="kosmos.dev/acme" />
      <FieldDescription>Only the owner can change this.</FieldDescription>
    </Field>
  );
}
