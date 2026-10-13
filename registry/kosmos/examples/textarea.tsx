import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Textarea } from '@/registry/kosmos/ui/textarea';

const rows = ['placeholder', 'filled'] as const;
const states = ['default', 'focus', 'invalid', 'invalid focus', 'disabled'] as const;

function stateProps(state: (typeof states)[number]) {
  if (state === 'invalid') return { 'aria-invalid': true } as const;
  if (state === 'invalid focus') return { 'aria-invalid': true, 'data-preview': 'focus' } as const;
  return previewState(state);
}

const longText =
  'The migration moves every workspace to the new billing plan. Admins get an email a week before, and nothing changes for members. If a workspace has unpaid invoices, it stays on the old plan until they are settled, and support reaches out to its admins directly.';

export default function TextareaPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Content × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => (
            <Textarea
              aria-label={`Note, ${row}, ${state}`}
              placeholder="Add a note"
              defaultValue={row === 'filled' ? 'Call back on Monday.' : undefined}
              {...stateProps(state)}
            />
          )}
        />
      </PreviewSection>

      <PreviewSection title="Grows with long text">
        <div className="max-w-md">
          <Textarea aria-label="Release notes" defaultValue={longText} />
        </div>
      </PreviewSection>

      <PreviewSection title="Taller start, read-only">
        <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
          <Textarea aria-label="Description" placeholder="Describe the issue" className="min-h-28" />
          <Textarea aria-label="Audit note" defaultValue="Approved by finance on 11 October." readOnly />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
