import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { PasswordInput } from '@/registry/kosmos/ui/password-input';

export default function PasswordInputDemo() {
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel>Password</FieldLabel>
      <PasswordInput name="password" autoComplete="new-password" />
      <FieldDescription>At least 8 characters.</FieldDescription>
    </Field>
  );
}
