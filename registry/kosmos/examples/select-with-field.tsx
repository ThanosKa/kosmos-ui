import { Field, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';

const roles = { viewer: 'Viewer', editor: 'Editor', admin: 'Admin' };

function RoleSelect() {
  return (
    <Select name="role" items={roles}>
      <SelectTrigger>
        <SelectValue placeholder="Pick a role" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(roles).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function SelectWithField() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <Field>
        <FieldLabel nativeLabel={false} render={<div />}>
          Role
        </FieldLabel>
        <RoleSelect />
        <FieldDescription>Editors can change projects but not billing.</FieldDescription>
      </Field>
      <Field invalid>
        <FieldLabel nativeLabel={false} render={<div />}>
          Role
        </FieldLabel>
        <RoleSelect />
        <FieldError>Pick a role for this member.</FieldError>
      </Field>
    </div>
  );
}
