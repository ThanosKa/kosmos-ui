'use client';

import { OverlayStage } from '@/components/preview/overlay-stage';
import { DataSetPreview } from '@/components/preview/data-set-preview';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { DangerZone, SettingsCard, SettingsPage } from '@/registry/kosmos/blocks/settings/settings';
import { Field, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';

function Fields({ name = 'Acme' }: { name?: string }) {
  return (
    <Field>
      <FieldLabel>Name</FieldLabel>
      <Input defaultValue={name} />
    </Field>
  );
}

const noop = () => {};
const frame = 'w-full rounded-xl border border-transparent bg-background p-4 shadow-card sm:p-6';

export default function SettingsPreview() {
  return <DataSetPreview demo={<Demo />} worst={<Worst />} />;
}

const worstProfile = {
  name: 'Alexandra Konstantinopoulou-Papadimitriou for the Growth and Platform teams',
  email: 'alexandra.konstantinopoulou-papadimitriou.with.a.very.long.address@subdomain.example-company.example',
  username: 'alexandra-konstantinopoulou-papadimitriou',
  bio: '山田 太郎 🚀 Product lead for the Europe and Middle East data region. I decide what Acme builds next, and I answer every customer email myself.',
};

const worstWorkspace = 'Acme Staging, the Europe and Middle East data region for every customer';

function Worst() {
  return (
    <PreviewStack>
      <PreviewSection title="Long title, description, error and values in a narrow card">
        <div className="grid gap-6 lg:grid-cols-2">
          <SettingsCard
            className="max-w-xs"
            title="A very long settings title that wraps onto a second line in a narrow card"
            description="A description that runs long as well, so the header has to wrap without pushing the footer."
            dirty
            state="error"
            error="Unable to save: the server answered with an error that has a long message."
            saveLabel="Save workspace settings"
            onSave={noop}
            onReset={noop}
          >
            <Fields name="Ακμή Ρομποτική 🤖" />
          </SettingsCard>
        </div>
      </PreviewSection>

      <PreviewSection title="Settings page with long profile values and workspace name">
        <div className={frame}>
          <SettingsPage profile={worstProfile} workspaceName={worstWorkspace} />
        </div>
      </PreviewSection>

      <PreviewSection title="Danger zone: confirmation open with a long workspace name">
        <OverlayStage label="delete workspace" className="h-[32rem]">
          {(container) => (
            <div className="p-4">
              <DangerZone
                defaultOpenAction="delete-workspace"
                container={container}
                modal={false}
                actions={[
                  {
                    id: 'delete-workspace',
                    title: 'Delete workspace',
                    description: `Removes every project, member and key of ${worstWorkspace}. This cannot be undone.`,
                    label: 'Delete workspace',
                    successMessage: 'Workspace deleted. Its projects, members and keys are gone.',
                    confirmText: worstWorkspace,
                  },
                ]}
              />
            </div>
          )}
        </OverlayStage>
      </PreviewSection>

      <PreviewSection title="Worst case in a narrow container">
        <div className={`${frame} max-w-sm`}>
          <SettingsPage headingLevel={3} profile={worstProfile} workspaceName={worstWorkspace} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}

function Demo() {
  return (
    <PreviewStack>
      <PreviewSection title="Settings card: nothing changed, changed, saving, saved, failed">
        <div className="grid gap-6 lg:grid-cols-2">
          <SettingsCard title="Workspace" description="The name people see." dirty={false} onSave={noop} onReset={noop}>
            <Fields />
          </SettingsCard>
          <SettingsCard title="Workspace" description="The name people see." dirty onSave={noop} onReset={noop}>
            <Fields name="Acme Robotics" />
          </SettingsCard>
          <SettingsCard title="Workspace" description="The name people see." dirty state="saving" onSave={noop} onReset={noop}>
            <Fields name="Acme Robotics" />
          </SettingsCard>
          <SettingsCard title="Workspace" description="The name people see." dirty={false} state="saved" onSave={noop} onReset={noop}>
            <Fields name="Acme Robotics" />
          </SettingsCard>
          <SettingsCard
            title="Workspace"
            description="The name people see."
            dirty
            state="error"
            error="That name is taken by another workspace. Pick a different one."
            onSave={noop}
            onReset={noop}
          >
            <Fields name="Acme Robotics" />
          </SettingsCard>
        </div>
      </PreviewSection>

      <PreviewSection title="Settings page">
        <div className={frame}>
          <SettingsPage defaultCurrent="notifications" />
        </div>
      </PreviewSection>

      <PreviewSection title="Settings page in a narrow container">
        <div className={`${frame} max-w-sm`}>
          <SettingsPage headingLevel={3} />
        </div>
      </PreviewSection>

      <PreviewSection title="Danger zone: confirmation open, workspace name not typed yet">
        <OverlayStage label="delete workspace" className="h-[28rem]">
          {(container) => (
            <div className="p-4">
              <DangerZone
                defaultOpenAction="delete-workspace"
                container={container}
                modal={false}
                actions={[
                  {
                    id: 'delete-workspace',
                    title: 'Delete workspace',
                    description: 'Removes every project, member and key. This cannot be undone.',
                    label: 'Delete workspace',
                    successMessage: 'Workspace deleted. Its projects, members and keys are gone.',
                    confirmText: 'Acme',
                  },
                ]}
              />
            </div>
          )}
        </OverlayStage>
      </PreviewSection>
    </PreviewStack>
  );
}
