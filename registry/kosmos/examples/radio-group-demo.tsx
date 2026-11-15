import { Field, FieldItem, FieldLabel } from '@/registry/kosmos/ui/field';
import { RadioGroup, RadioGroupItem } from '@/registry/kosmos/ui/radio-group';

const schedules = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every Monday' },
  { value: 'never', label: 'Never' },
];

export default function RadioGroupDemo() {
  return (
    <Field name="summary">
      <FieldLabel nativeLabel={false} render={<div />}>
        Send the summary email
      </FieldLabel>
      <RadioGroup defaultValue="weekly">
        {schedules.map((schedule) => (
          <FieldItem key={schedule.value}>
            <RadioGroupItem value={schedule.value} />
            <FieldLabel>{schedule.label}</FieldLabel>
          </FieldItem>
        ))}
      </RadioGroup>
    </Field>
  );
}
