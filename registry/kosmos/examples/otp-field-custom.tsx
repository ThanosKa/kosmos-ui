import { Field, FieldLabel } from '@/registry/kosmos/ui/field';
import { OtpField, OtpFieldInput, OtpFieldSeparator } from '@/registry/kosmos/ui/otp-field';

export default function OtpFieldCustom() {
  return (
    <Field>
      <FieldLabel>Door code</FieldLabel>
      <OtpField length={4} mask>
        <OtpFieldInput />
        <OtpFieldInput aria-label="Character 2 of 4" />
        <OtpFieldSeparator />
        <OtpFieldInput aria-label="Character 3 of 4" />
        <OtpFieldInput aria-label="Character 4 of 4" />
      </OtpField>
    </Field>
  );
}
