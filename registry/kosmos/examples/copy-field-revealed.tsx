import { CopyField } from '@/registry/kosmos/ui/copy-field';
import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';

export default function CopyFieldRevealed() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>New secret key</FieldLabel>
      <CopyField secret defaultRevealed label="secret key" value="acme_secret_demo_7Q2Kf9r3Vx" />
      <FieldDescription>Copy it now. Once you leave this page it shows only its last four characters.</FieldDescription>
    </Field>
  );
}
