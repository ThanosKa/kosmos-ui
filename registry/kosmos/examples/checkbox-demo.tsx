import { Checkbox } from '@/registry/kosmos/ui/checkbox';

export default function CheckboxDemo() {
  return (
    <label className="flex items-center gap-3 text-body font-medium text-foreground">
      <Checkbox name="assigned" defaultChecked />
      Email me when a task is assigned to me
    </label>
  );
}
