import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { OtpField } from '@/registry/kosmos/ui/otp-field';

export default function OtpFieldDemo() {
  return (
    <Field>
      <FieldLabel>Verification code</FieldLabel>
      <OtpField name="code" />
      <FieldDescription>We sent a 6-digit code to lena@acme.example.</FieldDescription>
    </Field>
  );
}
