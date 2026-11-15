import { Field, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { OtpField } from '@/registry/kosmos/ui/otp-field';

export default function OtpFieldInvalid() {
  return (
    <Field invalid>
      <FieldLabel>Verification code</FieldLabel>
      <OtpField defaultValue="424241" />
      <FieldError>That code is wrong or has expired. Check the latest email, or send a new code.</FieldError>
    </Field>
  );
}
