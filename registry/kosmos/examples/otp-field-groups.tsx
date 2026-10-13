import { Field, FieldLabel } from '@/registry/kosmos/ui/field';
import { OtpField } from '@/registry/kosmos/ui/otp-field';

export default function OtpFieldGroups() {
  return (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel>Verification code</FieldLabel>
        <OtpField groupSize={3} />
      </Field>
      <Field>
        <FieldLabel>Recovery code</FieldLabel>
        <OtpField length={8} groupSize={4} validationType="alphanumeric" />
      </Field>
    </div>
  );
}
