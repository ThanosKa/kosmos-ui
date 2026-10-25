import { Field, FieldContent, FieldDescription, FieldItem, FieldLabel } from '@/registry/kosmos/ui/field';
import { RadioGroup, RadioGroupItem } from '@/registry/kosmos/ui/radio-group';

const regions = [
  { value: 'us', label: 'United States', description: 'Events are stored in Virginia and Oregon.' },
  { value: 'eu', label: 'European Union', description: 'Events are stored in Frankfurt and never leave Europe.' },
];

export default function RadioGroupDescription() {
  return (
    <Field name="region" className="w-full max-w-sm">
      <FieldLabel nativeLabel={false} render={<div />}>
        Data region
      </FieldLabel>
      <RadioGroup defaultValue="eu">
        {regions.map((region) => (
          <FieldItem key={region.value}>
            <RadioGroupItem value={region.value} />
            <FieldContent>
              <FieldLabel>{region.label}</FieldLabel>
              <FieldDescription>{region.description}</FieldDescription>
            </FieldContent>
          </FieldItem>
        ))}
      </RadioGroup>
    </Field>
  );
}
