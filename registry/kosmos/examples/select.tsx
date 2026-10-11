import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
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

const statuses = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
  { value: 'canceled', label: 'Canceled' },
];

const rows = ['placeholder', 'value'] as const;
const states = ['default', 'hover', 'focus', 'invalid', 'disabled'] as const;

function stateProps(state: (typeof states)[number]) {
  if (state === 'invalid') return { 'aria-invalid': true } as const;
  return previewState(state);
}

function StatusItems() {
  return statuses.map((status) => (
    <SelectItem key={status.value} value={status.value} disabled={status.value === 'canceled'}>
      {status.label}
    </SelectItem>
  ));
}

export default function SelectPreview() {
  return (
    <PreviewStack>
      {/* First on the page, so the pinned popup has room below its trigger at every width. */}
      <PreviewSection title="Open: groups, separator, selected, disabled">
        <div className="min-h-76">
          <Select
            defaultOpen
            modal={false}
            defaultValue="eu-west"
            items={{ 'us-east': 'US East', 'us-west': 'US West', 'eu-west': 'EU West', 'eu-central': 'EU Central', 'ap-south': 'Asia Pacific South' }}
          >
            <SelectTrigger aria-label="Region" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
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
              <SelectSeparator />
              <SelectItem value="ap-south">Asia Pacific South</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PreviewSection>

      <PreviewSection title="Trigger × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => (
            <Select items={statuses} defaultValue={row === 'value' ? 'in-progress' : null} disabled={state === 'disabled'}>
              <SelectTrigger aria-label={`Status, ${row}, ${state}`} className="w-full" {...stateProps(state)}>
                <SelectValue placeholder="Pick a status" />
              </SelectTrigger>
              <SelectContent>
                <StatusItems />
              </SelectContent>
            </Select>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Long value in a narrow trigger">
        <Select defaultValue="long" items={{ long: 'Quarterly revenue forecast for every region' }}>
          <SelectTrigger aria-label="Report" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="long">Quarterly revenue forecast for every region</SelectItem>
          </SelectContent>
        </Select>
      </PreviewSection>
    </PreviewStack>
  );
}
