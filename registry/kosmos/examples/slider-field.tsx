import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { Slider } from '@/registry/kosmos/ui/slider';

export default function SliderField() {
  return (
    <Field name="seats" className="w-full max-w-xs">
      <FieldLabel nativeLabel={false} render={<div />}>
        Seats
      </FieldLabel>
      <Slider defaultValue={12} min={1} max={50} />
      <FieldDescription>Each seat is billed monthly.</FieldDescription>
    </Field>
  );
}
