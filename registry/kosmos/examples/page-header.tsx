'use client';

import { PanelLeft } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { PageHeader } from '@/registry/kosmos/blocks/page-header/page-header';
import { Button } from '@/registry/kosmos/ui/button';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card';

const toggle = (
  <Button variant="secondary" size="icon" aria-label="Toggle sidebar">
    <PanelLeft aria-hidden />
  </Button>
);

function Body({ text = 'Page content' }: { text?: string }) {
  return <p className="h-24 p-4 text-body text-muted-foreground">{text}</p>;
}

export default function PageHeaderPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Filter menu open, two filters on">
        <div className={`${frame} pb-80`}>
          <PageHeader
            leading={toggle}
            defaultTab="live"
            filters={['scale', 'ios']}
            filterMenu={{ open: true, modal: false }}
            onAction={() => {}}
          >
            <Body />
          </PageHeader>
        </div>
      </PreviewSection>

      <PreviewSection title="Default">
        <div className={frame}>
          <PageHeader leading={toggle} onAction={() => {}}>
            <Body />
          </PageHeader>
        </div>
      </PreviewSection>

      <PreviewSection title="Search text, three filters on, h2 title">
        <div className={frame}>
          <PageHeader
            leading={toggle}
            headingLevel={2}
            defaultTab="trial"
            query="tide"
            defaultFilters={['pro', 'ios', 'web']}
            onAction={() => {}}
          >
            <Body text="Tidepool Notes" />
          </PageHeader>
        </div>
      </PreviewSection>

      <PreviewSection title="In a narrow container, long title, no description, no More actions menu">
        <div className={`${frame} max-w-sm`}>
          <PageHeader
            leading={toggle}
            title="Scale plan projects that are live, on trial or paused"
            description=""
            newLabel="New project"
            defaultFilters={['scale', 'server']}
            tabs={[
              { value: 'all', label: 'All projects', count: 1284 },
              { value: 'live', label: 'Live', count: 1032 },
              { value: 'trial', label: 'Trial', count: 187 },
              { value: 'paused', label: 'Paused this month', count: 65 },
            ]}
          >
            <Body />
          </PageHeader>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
