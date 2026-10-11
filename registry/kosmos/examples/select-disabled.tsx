import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';

const plans = { free: 'Free', team: 'Team', enterprise: 'Enterprise' };

export default function SelectDisabled() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select name="plan" items={plans} defaultValue="team" disabled>
        <SelectTrigger aria-label="Plan" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(plans).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select name="upgrade" items={plans} defaultValue="free">
        <SelectTrigger aria-label="Upgrade to" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="team">Team</SelectItem>
          <SelectItem value="enterprise" disabled>
            Enterprise
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
