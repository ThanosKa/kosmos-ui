import { Field, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';

export default function InputInvalid() {
  return (
    <Field invalid className="w-full max-w-xs">
      <FieldLabel>Email</FieldLabel>
      <Input type="email" name="email" defaultValue="ada@kosmos" />
      <FieldError>Enter an email address with a domain, such as name@company.com.</FieldError>
    </Field>
  );
}
