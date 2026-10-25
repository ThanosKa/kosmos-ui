import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/registry/kosmos/ui/input-group';

export default function InputGroupTextExample() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Field>
        <FieldLabel>Project URL</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>acme.example/</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput name="slug" defaultValue="fernhill" />
        </InputGroup>
        <FieldDescription>Lowercase letters, numbers and dashes.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Monthly budget</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>$</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput name="budget" inputMode="decimal" defaultValue="1,200.00" className="tabular-nums" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>USD</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </div>
  );
}
