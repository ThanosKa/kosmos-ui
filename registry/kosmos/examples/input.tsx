import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Button } from '@/registry/kosmos/ui/button';
import { Input } from '@/registry/kosmos/ui/input';

const rows = ['placeholder', 'filled'] as const;
const states = ['default', 'focus', 'invalid', 'disabled'] as const;

function stateProps(state: (typeof states)[number]) {
  if (state === 'invalid') return { 'aria-invalid': true } as const;
  return previewState(state);
}

export default function InputPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Content × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => (
            <Input
              aria-label={`Email, ${row}, ${state}`}
              type="email"
              placeholder="name@company.com"
              defaultValue={row === 'filled' ? 'ada@kosmos.dev' : undefined}
              {...stateProps(state)}
            />
          )}
        />
      </PreviewSection>

      <PreviewSection title="Types">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input aria-label="Password" type="password" defaultValue="correct horse" />
          <Input aria-label="Seats" type="number" defaultValue={12} className="tabular-nums" />
          <Input aria-label="Search projects" type="search" placeholder="Search projects" />
          <Input aria-label="Attachment" type="file" />
          <Input aria-label="Website" type="url" defaultValue="https://kosmos.dev" readOnly />
          <Input aria-label="Due date" type="date" defaultValue="2026-10-11" />
        </div>
      </PreviewSection>

      <PreviewSection title="Beside a button">
        <div className="flex max-w-sm gap-2">
          <Input aria-label="Invite by email" type="email" placeholder="name@company.com" />
          <Button variant="secondary">Invite</Button>
        </div>
      </PreviewSection>

      <PreviewSection title="Long value in a narrow slot">
        <div className="w-48">
          <Input aria-label="Project name" defaultValue="Quarterly revenue forecast for every region and product line" />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
