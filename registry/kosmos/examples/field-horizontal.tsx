import { Field, FieldContent, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';

const roles = { viewer: 'Viewer', editor: 'Editor', admin: 'Admin' };

export default function FieldHorizontal() {
  return (
    <div className="flex w-full max-w-lg flex-col divide-y divide-border">
      <Field orientation="horizontal" className="pb-4">
        <FieldContent>
          <FieldLabel nativeLabel={false} render={<div />}>
            Default role
          </FieldLabel>
          <FieldDescription>New members join with this role.</FieldDescription>
        </FieldContent>
        <Select name="default-role" items={roles} defaultValue="viewer">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(roles).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field orientation="horizontal" className="pt-4">
        <FieldContent>
          <FieldLabel>Session timeout</FieldLabel>
          <FieldDescription>Minutes of inactivity before members sign in again.</FieldDescription>
        </FieldContent>
        <Input type="number" name="timeout" min={5} defaultValue={30} className="w-20 tabular-nums" />
      </Field>
    </div>
  );
}
