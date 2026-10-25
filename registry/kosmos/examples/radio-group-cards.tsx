import { Field, FieldLabel } from '@/registry/kosmos/ui/field';
import { RadioCard, RadioCardDescription, RadioCardTitle, RadioGroup } from '@/registry/kosmos/ui/radio-group';

const plans = [
  { value: 'free', name: 'Free', price: '$0', description: 'Up to 50,000 events a month.' },
  { value: 'pro', name: 'Pro', price: 'From $49 a month', description: 'Up to 3 million events a month.' },
  { value: 'scale', name: 'Scale', price: 'From $1,200 a month', description: 'Up to 8 million events and a nightly export.' },
];

export default function RadioGroupCards() {
  return (
    <Field name="plan" className="w-full max-w-2xl">
      <FieldLabel nativeLabel={false} render={<div />}>
        Plan
      </FieldLabel>
      <RadioGroup defaultValue="pro" className="sm:grid-cols-3">
        {plans.map((plan) => (
          <RadioCard key={plan.value} value={plan.value}>
            <RadioCardTitle>{plan.name}</RadioCardTitle>
            <RadioCardDescription>{plan.description}</RadioCardDescription>
            <RadioCardDescription className="mt-2 text-body text-foreground tabular-nums">{plan.price}</RadioCardDescription>
          </RadioCard>
        ))}
      </RadioGroup>
    </Field>
  );
}
