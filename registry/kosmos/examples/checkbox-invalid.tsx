import { Checkbox } from '@/registry/kosmos/ui/checkbox';
import { Field, FieldContent, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';

export default function CheckboxInvalid() {
  return (
    <Field name="terms" orientation="horizontal" invalid className="w-full max-w-sm">
      <Checkbox required />
      <FieldContent>
        <FieldLabel>I accept the terms of service</FieldLabel>
        <FieldError>Accept the terms to create the workspace.</FieldError>
      </FieldContent>
    </Field>
  );
}
