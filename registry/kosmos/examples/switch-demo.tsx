import { Switch } from '@/registry/kosmos/ui/switch';

export default function SwitchDemo() {
  return (
    <label className="flex items-center gap-3 text-body font-medium text-foreground">
      <Switch name="show-completed" defaultChecked />
      Show completed tasks
    </label>
  );
}
