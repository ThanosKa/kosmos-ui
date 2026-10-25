import { Field, FieldError, FieldItem, FieldLabel } from '@/registry/kosmos/ui/field';
import { RadioGroup, RadioGroupItem } from '@/registry/kosmos/ui/radio-group';

const platforms = [
  { value: 'web', label: 'Web' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'server', label: 'Server' },
];

export default function RadioGroupInvalid() {
  return (
    <Field name="platform" invalid>
      <FieldLabel nativeLabel={false} render={<div />}>
        Platform
      </FieldLabel>
      <RadioGroup required>
        {platforms.map((platform) => (
          <FieldItem key={platform.value}>
            <RadioGroupItem value={platform.value} />
            <FieldLabel>{platform.label}</FieldLabel>
          </FieldItem>
        ))}
      </RadioGroup>
      <FieldError>Pick the platform this project sends events from.</FieldError>
    </Field>
  );
}
