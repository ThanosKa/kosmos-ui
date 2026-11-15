import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';

export default function InputWithLabel() {
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel>Email</FieldLabel>
      <Input type="email" name="email" autoComplete="email" placeholder="name@company.com" />
      <FieldDescription>We send invoices to this address.</FieldDescription>
    </Field>
  );
}
