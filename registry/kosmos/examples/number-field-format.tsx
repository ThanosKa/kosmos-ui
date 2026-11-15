import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { NumberField } from '@/registry/kosmos/ui/number-field';

export default function NumberFieldFormat() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <Field name="agent-budget">
        <FieldLabel>Monthly agent budget</FieldLabel>
        <NumberField
          defaultValue={2000}
          min={0}
          step={100}
          largeStep={1000}
          format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
          locale="en-US"
        />
        <FieldDescription>Agents stop once Acme reaches it.</FieldDescription>
      </Field>
      <Field name="quota-warning">
        <FieldLabel>Warn at</FieldLabel>
        <NumberField defaultValue={0.75} min={0.5} max={1} step={0.05} format={{ style: 'percent' }} locale="en-US" />
        <FieldDescription>Of a project&apos;s monthly event allowance.</FieldDescription>
      </Field>
    </div>
  );
}
