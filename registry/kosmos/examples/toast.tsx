'use client';

import { useEffect, useState } from 'react';
import { DataSetPreview } from '@/components/preview/data-set-preview';
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
  { label: 'title and description', toasts: [{ title: 'Invite sent', description: 'Kai Nakamura will get an email in a minute.' }] },
  { label: 'title only', toasts: [{ title: 'Link copied' }] },
  { label: 'success', toasts: [{ type: 'success', title: 'Changes saved', description: 'The roadmap is up to date.' }] },
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
    toasts: [{ type: 'success', title: 'Roadmap item archived', actionProps: { children: 'Undo' } }],
  },
  {
    label: 'long text',
    className: 'h-96',
    toasts: [
      {
        type: 'warning',
        title: 'Acme workspace billing for the Scale plan could not be charged automatically',
        description:
          'The card ending in 4242 was declined. Update the payment method before October 24 to keep the Scale plan and its raised event quota.',
        actionProps: { children: 'Update card' },
      },
    ],
  },
];

const worstCases: { label: string; toasts: ToastOptions[]; className?: string }[] = [
  {
    label: 'long title, an email and a long action',
    className: 'h-96',
    toasts: [
      {
        type: 'error',
        title: 'Could not send the invitation to bartholomew.fitzgerald@northwind-industries-holdings.example.com',
        description: 'Supercalifragilisticexpialidocious-workspace-name-with-no-spaces-at-all is over the limit of 1,284 members.',
        actionProps: { children: 'Upgrade the Northwind Industries plan' },
      },
    ],
  },
  {
    label: 'title with a long action, no description',
    toasts: [{ type: 'success', title: 'Roadmap item archived', actionProps: { children: 'Undo and restore to the previous column' } }],
  },
  {
    label: 'emoji and Japanese',
    toasts: [{ type: 'info', title: '🚀 Launch checklist 日本語のドキュメントと価格表', description: '🎉🎉🎉 株式会社ノースウィンド に 1,284,000 件のイベントが届きました。' }],
  },
  {
    label: 'Arabic',
    toasts: [{ type: 'warning', title: 'دعم اللغة العربية في لوحة التحكم', description: 'ليلى أضافت 12,480 عنصرًا إلى القائمة.' }],
  },
  { label: 'one letter', toasts: [{ title: 'Q', description: 'X' }] },
  { label: 'description only', toasts: [{ description: 'Saved.' }] },
  { label: 'a huge number', toasts: [{ type: 'loading', title: 'Exporting 1,284,000,000 rows from 12,480 projects…' }] },
  {
    label: 'stack of three, the front one long',
    className: 'h-96',
    toasts: [
      { title: 'Q' },
      { type: 'success', title: 'Changes saved to Copperline Bank, Ironbark Logistics and Northwind Industries Holdings' },
      {
        type: 'error',
        title: 'Aleksandra Wiśniewska-Kowalczyk could not be added',
        description: 'bartholomew.fitzgerald@northwind-industries-holdings.example.com already belongs to another workspace.',
        actionProps: { children: 'Retry' },
      },
    ],
  },
];

export default function ToastPreview() {
  return <DataSetPreview demo={<Demo />} worst={<Worst />} />;
}

function Worst() {
  return (
    <PreviewStack>
      <PreviewSection title="Long text, an email with no break, emoji, non-Latin text and extreme numbers">
        <OverlayStageGrid>
          {worstCases.map((item) => (
            <OverlayStage key={item.label} label={item.label} className={item.className ?? 'h-48'}>
              {(container) => <PinnedToasts container={container} toasts={item.toasts} />}
            </OverlayStage>
          ))}
        </OverlayStageGrid>
      </PreviewSection>
    </PreviewStack>
  );
}

function Demo() {
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
                  { title: 'Invite sent', description: 'Kai Nakamura will get an email in a minute.' },
                  { type: 'success', title: 'Changes saved' },
                  { type: 'info', title: 'Ama Mensah joined Acme Staging', description: 'She can see all 12 projects.' },
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
            onClick={() => toast.add({ title: 'Invite sent', description: 'Kai Nakamura will get an email in a minute.' })}
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
