import { Field, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';

export default function InputTypes() {
  return (
    <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel>Password</FieldLabel>
        <Input type="password" name="password" autoComplete="current-password" />
      </Field>
      <Field>
        <FieldLabel>Seats</FieldLabel>
        <Input type="number" name="seats" min={1} defaultValue={5} className="tabular-nums" />
      </Field>
      <Field>
        <FieldLabel>Start date</FieldLabel>
        <Input type="date" name="start" />
      </Field>
      <Field>
        <FieldLabel>Logo</FieldLabel>
        <Input type="file" name="logo" accept="image/*" />
      </Field>
    </div>
  );
}
