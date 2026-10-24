import { Rocket } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Alert, AlertAction, AlertDescription, AlertTitle, type AlertVariant } from '@/registry/kosmos/ui/alert';
import { Button } from '@/registry/kosmos/ui/button';

const variants = ['neutral', 'info', 'success', 'warning', 'destructive'] as const satisfies readonly AlertVariant[];
const linkStates = ['default', 'hover', 'focus'] as const;

const copy: Record<AlertVariant, { title: string; description: string; link: string }> = {
  neutral: {
    title: 'Events arrive within a minute',
    description: 'Counts on this page refresh every 60 seconds.',
    link: 'How ingestion works',
  },
  info: {
    title: 'The EU data region is live',
    description: 'New projects can keep their events in Frankfurt.',
    link: 'Move a project',
  },
  success: {
    title: 'Cirrus Weather is on the Scale plan',
    description: 'Its allowance is now 8,000,000 events a month.',
    link: 'See the invoice',
  },
  warning: {
    title: 'Ironbark Logistics is at 79% of its quota',
    description: 'Events past the allowance are billed at the Scale rate.',
    link: 'Raise the allowance',
  },
  destructive: {
    title: 'Copperline Bank passed its quota',
    description: 'It sent 8,730,100 events against an allowance of 8,000,000.',
    link: 'Review the usage',
  },
};

export default function AlertPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Variants">
        <div className="flex flex-col gap-3">
          {variants.map((variant) => (
            <Alert key={variant} variant={variant}>
              <AlertTitle>{copy[variant].title}</AlertTitle>
              <AlertDescription>
                {copy[variant].description} <a href="https://acme.example/docs">{copy[variant].link}</a>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Link × states">
        <StateMatrix
          rows={variants}
          states={linkStates}
          render={(variant, state) => (
            <Alert variant={variant} icon={null}>
              <AlertDescription>
                <a href="https://acme.example/docs" {...previewState(state)}>
                  {copy[variant].link}
                </a>
              </AlertDescription>
            </Alert>
          )}
        />
      </PreviewSection>

      <PreviewSection title="With actions">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex flex-col gap-3">
            <Alert variant="warning">
              <AlertTitle>Cirrus Weather is at 80% of its quota</AlertTitle>
              <AlertDescription>It will reach 3,000,000 events around October 18.</AlertDescription>
              <AlertAction>
                <Button variant="secondary" size="sm">
                  Upgrade to Scale
                </Button>
              </AlertAction>
            </Alert>
            <Alert variant="neutral">
              <AlertTitle>Acme Staging is on the Free plan</AlertTitle>
              <AlertAction>
                <Button variant="ghost" size="sm">
                  Dismiss
                </Button>
                <Button variant="secondary" size="sm">
                  Compare plans
                </Button>
              </AlertAction>
            </Alert>
          </div>
          <Alert variant="destructive">
            <AlertTitle>Hollow Oak Games stopped sending events</AlertTitle>
            <AlertDescription>The last one arrived on September 18, when the project was paused.</AlertDescription>
            <AlertAction>
              <Button variant="secondary" size="sm">
                Resume the project
              </Button>
            </AlertAction>
          </Alert>
        </div>
      </PreviewSection>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Title only, own icon, no icon">
          <div className="flex flex-col gap-3">
            <Alert variant="success">
              <AlertTitle>Saved</AlertTitle>
            </Alert>
            <Alert variant="info" icon={<Rocket />}>
              <AlertTitle>Mobile SDK 3.0 ships in Q4 2026</AlertTitle>
            </Alert>
            <Alert variant="neutral" icon={null}>
              <AlertDescription>Dates on this page are in UTC.</AlertDescription>
            </Alert>
          </div>
        </PreviewSection>

        <PreviewSection title="Long text in a narrow slot">
          <div className="flex w-full max-w-64 flex-col gap-3">
            <Alert variant="destructive">
              <AlertTitle>The weekly summary could not be sent to kai.nakamura.growth-team-weekly-digest@acme.example</AlertTitle>
              <AlertDescription>
                The mailbox is full. Ask Kai to free some space, then send it again from{' '}
                <a href="https://acme.example/settings/notifications">https://acme.example/settings/notifications/weekly-summary</a>.
              </AlertDescription>
            </Alert>
          </div>
        </PreviewSection>
      </div>

      <PreviewSection title="On a card">
        <div className="flex flex-col gap-3 rounded-2xl border border-transparent bg-card p-4 shadow-card">
          <p className="text-title">Event quota</p>
          {(['info', 'warning', 'destructive'] as const).map((variant) => (
            <Alert key={variant} variant={variant}>
              <AlertTitle>{copy[variant].title}</AlertTitle>
            </Alert>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
