import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/registry/kosmos/ui/select';

const regions = {
  'us-east': 'US East',
  'us-west': 'US West',
  'eu-west': 'EU West',
  'eu-central': 'EU Central',
};

export default function SelectGroups() {
  return (
    <Select name="region" items={regions}>
      <SelectTrigger aria-label="Region" className="w-44">
        <SelectValue placeholder="Pick a region" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel>Americas</SelectGroupLabel>
          <SelectItem value="us-east">US East</SelectItem>
          <SelectItem value="us-west">US West</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>Europe</SelectGroupLabel>
          <SelectItem value="eu-west">EU West</SelectItem>
          <SelectItem value="eu-central" disabled>
            EU Central
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
