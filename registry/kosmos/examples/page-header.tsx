'use client';

import { PanelLeft } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { PageHeader } from '@/registry/kosmos/blocks/page-header/page-header';
import { Button } from '@/registry/kosmos/ui/button';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card';

const toggle = (
  <Button variant="ghost" size="icon-sm" aria-label="Toggle sidebar" className="text-muted-foreground">
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
        <div className={`${frame} pb-56`}>
          <PageHeader
            leading={toggle}
            defaultTab="at-risk"
            filters={['maya', 'enterprise']}
            filterMenu={{ open: true, modal: false }}
          >
            <Body />
          </PageHeader>
        </div>
      </PreviewSection>

      <PreviewSection title="Default">
        <div className={frame}>
          <PageHeader leading={toggle}>
            <Body />
          </PageHeader>
        </div>
      </PreviewSection>

      <PreviewSection title="Search text and board layout">
        <div className={frame}>
          <PageHeader leading={toggle} defaultTab="active" query="north" view="board">
            <Body text="Board" />
          </PageHeader>
        </div>
      </PreviewSection>

      <PreviewSection title="In a narrow container, long title">
        <div className={`${frame} max-w-sm`}>
          <PageHeader
            leading={toggle}
            title="Enterprise renewals for the next two quarters"
            newLabel="New renewal"
            tabs={[
              { value: 'all', label: 'All renewals', count: 1284 },
              { value: 'mine', label: 'Assigned to me', count: 32 },
              { value: 'overdue', label: 'Overdue', count: 7 },
              { value: 'closed', label: 'Closed this month', count: 54 },
            ]}
          >
            <Body />
          </PageHeader>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
