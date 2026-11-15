import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix } from '@/components/preview/state-matrix';
import { CopyField } from '@/registry/kosmos/ui/copy-field';
import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import CopyFieldRevealed from '@/registry/kosmos/examples/copy-field-revealed';

const rows = ['plain', 'secret, hidden', 'secret, shown'] as const;
const states = ['default', 'disabled'] as const;

const key = 'acme_secret_demo_7Q2Kf9r3Vx';

export default function CopyFieldPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Kinds × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => (
            <CopyField
              aria-label={`Key, ${row}, ${state}`}
              label="secret key"
              secret={row !== 'plain'}
              defaultRevealed={row === 'secret, shown'}
              value={row === 'plain' ? 'proj_fernhill' : key}
              disabled={state === 'disabled'}
            />
          )}
        />
      </PreviewSection>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="In a Field">
          <Field>
            <FieldLabel>Webhook URL</FieldLabel>
            <CopyField label="webhook URL" value="https://hooks.acme.example/v1/fernhill/events" />
            <FieldDescription>Acme sends a POST here for every event.</FieldDescription>
          </Field>
        </PreviewSection>
        <PreviewSection title="Shown at first">
          <CopyFieldRevealed />
        </PreviewSection>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Short secret: only the 12 dots">
          <CopyField aria-label="Signing secret" label="signing secret" secret value="hunter2pass" />
        </PreviewSection>
        <PreviewSection title="Long secret: the same 12 dots, last four in view">
          <CopyField aria-label="Webhook secret" label="webhook secret" secret value="acme_whsig_MfKQ9r3Vx7bT2nLp8sYc4dZa1eWg6hJu0kRq5tNv" />
        </PreviewSection>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Long value in a narrow slot">
          <div className="w-56">
            <CopyField aria-label="Ingest URL" label="ingest URL" value="https://ingest.acme.example/v1/projects/fernhill-books/events?batch=true" />
          </div>
        </PreviewSection>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="In a toolbar, at the Button's height">
          <CopyField aria-label="Project ID" label="project ID" value="proj_fernhill" className="h-7.5 max-w-60" />
        </PreviewSection>
        <PreviewSection title="In a disabled Field: the buttons are disabled too">
          <Field disabled>
            <FieldLabel>Secret key</FieldLabel>
            <CopyField label="secret key" secret value={key} />
          </Field>
        </PreviewSection>
      </div>
    </PreviewStack>
  );
}
