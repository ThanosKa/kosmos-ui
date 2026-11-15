import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { NumberField } from '@/registry/kosmos/ui/number-field';

export default function NumberFieldDemo() {
  return (
    <Field name="retention" className="w-full max-w-xs">
      <FieldLabel>Keep events for</FieldLabel>
      <NumberField
        defaultValue={90}
        min={30}
        max={365}
        step={30}
        format={{ style: 'unit', unit: 'day', unitDisplay: 'long' }}
        locale="en-US"
      />
      <FieldDescription>Events older than this are deleted every night.</FieldDescription>
    </Field>
  );
}
