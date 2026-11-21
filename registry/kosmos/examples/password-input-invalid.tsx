import { Field, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { PasswordInput } from '@/registry/kosmos/ui/password-input';

export default function PasswordInputInvalid() {
  return (
    <Field invalid className="w-full max-w-xs">
      <FieldLabel>New password</FieldLabel>
      <PasswordInput name="password" autoComplete="new-password" defaultValue="acme" />
      <FieldError>Use at least 8 characters.</FieldError>
    </Field>
  );
}
