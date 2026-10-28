'use client';

import { useEffect } from 'react';
import { toast, type ExternalToast } from 'sonner';
import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Toaster } from '@/registry/kosmos/ui/sonner';

type Case = {
  label: string;
  className?: string;
  expand?: boolean;
  toasts: { type?: 'success' | 'info' | 'warning' | 'error' | 'loading'; title: string; options?: ExternalToast }[];
};

const cases: Case[] = [
  { label: 'title and description', toasts: [{ title: 'Invite sent', options: { description: 'Kai Nakamura will get an email in a minute.' } }] },
  { label: 'title only', toasts: [{ title: 'Link copied' }] },
  { label: 'success', toasts: [{ type: 'success', title: 'Changes saved', options: { description: 'Q4 roadmap is up to date.' } }] },
  {
    label: 'error, with action',
    toasts: [
      {
        type: 'error',
        title: 'Upload failed',
        options: { description: 'events-september.csv is larger than 25 MB.', action: { label: 'Retry', onClick: () => {} } },
      },
    ],
  },
  { label: 'warning', toasts: [{ type: 'warning', title: 'Event quota at 80%', options: { description: 'Cirrus Weather, October.' } }] },
  { label: 'info', toasts: [{ type: 'info', title: 'New version available', options: { description: 'Reload to update.' } }] },
  { label: 'loading', toasts: [{ type: 'loading', title: 'Exporting Fernhill Books events…' }] },
  {
    label: 'action and cancel',
    toasts: [
      {
        title: 'Delete 12,480 test events?',
        options: { cancel: { label: 'Cancel', onClick: () => {} }, action: { label: 'Delete', onClick: () => {} } },
      },
    ],
  },
  {
    label: 'stack, collapsed',
    toasts: [
      { title: 'Invite sent' },
      { type: 'success', title: 'Changes saved' },
      { title: 'Roadmap item archived', options: { description: 'Fix the retention chart tooltip moved to the archive.' } },
    ],
  },
  {
    label: 'stack, expanded',
    className: 'h-80',
    expand: true,
    toasts: [
      { title: 'Invite sent' },
      { type: 'success', title: 'Changes saved' },
      { title: 'Roadmap item archived', options: { description: 'Fix the retention chart tooltip moved to the archive.' } },
    ],
  },
  {
    label: 'long text',
    className: 'h-80',
    toasts: [
      {
        type: 'warning',
        title: 'Acme workspace billing for the Scale plan could not be charged automatically',
        options: {
          description:
            'The card ending in 4242 was declined. Update the payment method before October 24 to keep the Scale plan and its raised event quota.',
          action: { label: 'Update card', onClick: () => {} },
        },
      },
    ],
  },
];

/** A Toaster of its own inside an OverlayStage, holding its toasts open. */
function PinnedToasts({ id, toasts, expand }: { id: string; toasts: Case['toasts']; expand?: boolean }) {
  useEffect(() => {
    toasts.forEach(({ type, title, options }, index) => {
      // Ids keep a second run (React strict mode) from adding the toasts twice.
      const shared = { id: `${id}-${index}`, toasterId: id, duration: Infinity, ...options };
      if (type) toast[type](title, shared);
      else toast(title, shared);
    });
  }, [id, toasts]);
  return <Toaster id={id} expand={expand} position="bottom-center" />;
}

export default function SonnerPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Toasts">
        <OverlayStageGrid>
          {cases.map((entry, index) => (
            <OverlayStage key={entry.label} label={entry.label} className={entry.className ?? 'h-56'}>
              {() => <PinnedToasts id={`sonner-preview-${index}`} toasts={entry.toasts} expand={entry.expand} />}
            </OverlayStage>
          ))}
        </OverlayStageGrid>
      </PreviewSection>
    </PreviewStack>
  );
}
