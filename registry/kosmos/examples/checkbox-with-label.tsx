import { Checkbox } from '@/registry/kosmos/ui/checkbox';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';

export default function CheckboxWithLabel() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Field name="summary" orientation="horizontal">
        <Checkbox defaultChecked />
        <FieldContent>
          <FieldLabel>Weekly summary</FieldLabel>
          <FieldDescription>A digest of finished tasks, sent every Monday.</FieldDescription>
        </FieldContent>
      </Field>
      <Field name="product-news" orientation="horizontal">
        <Checkbox />
        <FieldLabel>Product news</FieldLabel>
      </Field>
    </div>
  );
}
