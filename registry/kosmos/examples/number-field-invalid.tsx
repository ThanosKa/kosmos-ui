import { Field, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { NumberField } from '@/registry/kosmos/ui/number-field';

export default function NumberFieldInvalid() {
  return (
    <Field name="rate-limit" invalid className="w-full max-w-xs">
      <FieldLabel>Requests per second</FieldLabel>
      <NumberField defaultValue={250} min={1} step={50} locale="en-US" />
      <FieldError>Free projects send up to 100 requests a second. Move to Pro to raise it.</FieldError>
    </Field>
  );
}
