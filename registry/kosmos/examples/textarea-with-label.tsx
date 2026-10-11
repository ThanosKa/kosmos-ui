import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { Textarea } from '@/registry/kosmos/ui/textarea';

export default function TextareaWithLabel() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>Bio</FieldLabel>
      <Textarea name="bio" maxLength={160} placeholder="Product designer in Athens. Into type and maps." />
      <FieldDescription>Up to 160 characters, shown on your profile.</FieldDescription>
    </Field>
  );
}
