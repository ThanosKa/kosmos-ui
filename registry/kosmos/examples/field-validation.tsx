import { Field, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';

// The docs hero. Not named field-demo: registry:check renders <name>-demo with only the item's own
// dependencies installed, and a Field needs a control from another item.
export default function FieldValidation() {
  return (
    <Field name="email" validationMode="onBlur" className="w-full max-w-xs">
      <FieldLabel>Email</FieldLabel>
      <Input type="email" required autoComplete="email" placeholder="name@company.com" />
      <FieldDescription>We send invoices to this address.</FieldDescription>
      <FieldError match="valueMissing">Enter your email address.</FieldError>
      <FieldError match="typeMismatch">Enter an email address with a domain, such as name@company.com.</FieldError>
    </Field>
  );
}
