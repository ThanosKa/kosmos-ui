import { Field, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';

// `invalid` and the message would come from your form library or the server's response.
export default function FieldInvalid() {
  return (
    <Field name="handle" invalid className="w-full max-w-xs">
      <FieldLabel>Username</FieldLabel>
      <Input defaultValue="ada" autoComplete="username" />
      <FieldError>Someone already has “ada”. Try another username, such as “ada-lovelace”.</FieldError>
    </Field>
  );
}
