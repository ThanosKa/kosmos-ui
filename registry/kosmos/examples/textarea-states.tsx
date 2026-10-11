import { Field, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Textarea } from '@/registry/kosmos/ui/textarea';

export default function TextareaStates() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <Field invalid>
        <FieldLabel>Reason for refund</FieldLabel>
        <Textarea name="reason" />
        <FieldError>Tell us why, so finance can approve the refund.</FieldError>
      </Field>
      <Field disabled>
        <FieldLabel>Audit note</FieldLabel>
        <Textarea name="audit" defaultValue="Approved by finance on 11 October." />
      </Field>
    </div>
  );
}
