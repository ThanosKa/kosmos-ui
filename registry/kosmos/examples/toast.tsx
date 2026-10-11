'use client';

import { useEffect, useState } from 'react';
import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Button } from '@/registry/kosmos/ui/button';
import { Toaster, createToastManager, toast } from '@/registry/kosmos/ui/toast';

type ToastOptions = Parameters<ReturnType<typeof createToastManager>['add']>[0];

/** A Toaster with its own manager, holding `toasts` open (no timeout) inside an OverlayStage. */
function PinnedToasts({ container, toasts }: { container: HTMLElement; toasts: ToastOptions[] }) {
  const [manager] = useState(() => createToastManager());
  useEffect(() => {
    // Ids keep a second run (React strict mode) from adding the toasts twice.
    toasts.forEach((options, index) => manager.add({ id: `toast-${index}`, timeout: 0, ...options }));
  }, [manager, toasts]);
  return <Toaster toastManager={manager} container={container} />;
}

const cases: { label: string; toasts: ToastOptions[]; className?: string }[] = [
  { label: 'title and description', toasts: [{ title: 'Invite sent', description: 'Ana Lopez will get an email in a minute.' }] },
  { label: 'title only', toasts: [{ title: 'Link copied' }] },
  { label: 'success', toasts: [{ type: 'success', title: 'Changes saved', description: 'Q3 Roadmap is up to date.' }] },
  {
    label: 'error, with action',
    toasts: [
      {
        type: 'error',
        title: 'Upload failed',
        description: 'report-q3.pdf is larger than 25 MB.',
        actionProps: { children: 'Retry' },
      },
    ],
  },
  { label: 'warning', toasts: [{ type: 'warning', title: 'Storage almost full', description: '92% of 50 GB used.' }] },
  { label: 'info', toasts: [{ type: 'info', title: 'New version available', description: 'Reload to update.' }] },
  { label: 'loading', toasts: [{ type: 'loading', title: 'Exporting 1,240 rows…' }] },
  {
    label: 'success, with Undo action',
    toasts: [{ type: 'success', title: 'Task archived', actionProps: { children: 'Undo' } }],
  },
  {
    label: 'long text',
    className: 'h-96',
    toasts: [
      {
        type: 'warning',
        title: 'Northwind Logistics workspace billing could not be renewed automatically',
        description:
          'The card ending in 4242 was declined. Update the payment method before October 24 to keep all 18 seats and the storage add-on.',
        actionProps: { children: 'Update card' },
      },
    ],
  },
];

export default function ToastPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Open">
        <OverlayStageGrid>
          {cases.map((item) => (
            <OverlayStage key={item.label} label={item.label} className={item.className ?? 'h-48'}>
              {(container) => <PinnedToasts container={container} toasts={item.toasts} />}
            </OverlayStage>
          ))}
          <OverlayStage label="stack of three (spread out under reduced motion)" className="h-80">
            {(container) => (
              <PinnedToasts
                container={container}
                toasts={[
                  { title: 'Invite sent', description: 'Ana Lopez will get an email in a minute.' },
                  { type: 'success', title: 'Changes saved' },
                  { type: 'info', title: 'Ben Carter joined Q3 Roadmap', description: 'He can see all 24 tasks.' },
                ]}
              />
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>

      <PreviewSection title="Live">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => toast.add({ title: 'Invite sent', description: 'Ana Lopez will get an email in a minute.' })}
          >
            Default
          </Button>
          <Button variant="secondary" onClick={() => toast.add({ type: 'success', title: 'Changes saved' })}>
            Success
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.add({
                type: 'error',
                title: 'Upload failed',
                description: 'report-q3.pdf is larger than 25 MB.',
                priority: 'high',
                timeout: 0,
                actionProps: { children: 'Retry' },
              })
            }
          >
            Error
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
                loading: 'Exporting 1,240 rows…',
                success: 'Export ready',
                error: 'Export failed',
              })
            }
          >
            Promise
          </Button>
        </div>
        <Toaster />
      </PreviewSection>
    </PreviewStack>
  );
}
