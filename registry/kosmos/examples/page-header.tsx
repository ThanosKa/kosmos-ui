'use client';

import { PanelLeft } from 'lucide-react';
import { DataSetPreview } from '@/components/preview/data-set-preview';
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

const worstTabs = [
  { value: 'all', label: 'All projects', count: 1284000 },
  { value: 'live', label: 'Live', count: 1032 },
  { value: 'trial', label: 'Trial', count: 187 },
  { value: 'paused', label: 'Paused this month', count: 65 },
  { value: 'archived', label: '🗄️ Archived', count: 0 },
  { value: 'jp', label: '日本のプロジェクト', count: 1 },
];

const worstFilters = [
  { value: 'scale', label: 'Scale plan, billed yearly with a custom contract', group: 'Plan' },
  { value: 'pro', label: 'Pro', group: 'Plan' },
  { value: 'server', label: 'Server-side ingestion for Fernhill Books Marketplace', group: 'Platform' },
  { value: 'ios', label: 'iOS', group: 'Platform' },
];

function WorstHeader() {
  return (
    <PageHeader
      leading={toggle}
      title="Scale plan projects that are live, on trial or paused, across every workspace"
      description="Every project that sends events to the Europe and Middle East data region, including the ones moved from Pro this quarter by the Growth and Platform teams."
      newLabel="New project from a template"
      onNew={() => {}}
      onAction={() => {}}
      query="alexandra.konstantinopoulou-papadimitriou.fernhill.example"
      filterOptions={worstFilters}
      defaultFilters={['scale', 'server']}
      tabs={worstTabs}
    >
      <Body />
    </PageHeader>
  );
}

function Worst() {
  return (
    <PreviewStack>
      <PreviewSection title="Long title and description, long filter labels, six tabs with extreme counts">
        <div className={frame}>
          <WorstHeader />
        </div>
      </PreviewSection>

      <PreviewSection title="Worst case in a narrow container">
        <div className={`${frame} max-w-sm`}>
          <WorstHeader />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}

export default function PageHeaderPreview() {
  return <DataSetPreview demo={<Demo />} worst={<Worst />} />;
}

function Demo() {
  return (
    <PreviewStack>
      <PreviewSection title="Filter menu open, two filters on">
        <div inert className={`${frame} pb-80`}>
          <PageHeader
            leading={toggle}
            defaultTab="live"
            filters={['scale', 'ios']}
            filterMenu={{ open: true, modal: false }}
            onAction={() => {}}
            onNew={() => {}}
          >
            <Body />
          </PageHeader>
        </div>
      </PreviewSection>

      <PreviewSection title="Default">
        <div className={frame}>
          <PageHeader leading={toggle} onAction={() => {}} onNew={() => {}}>
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
            onNew={() => {}}
          >
            <Body text="Tidepool Notes" />
          </PageHeader>
        </div>
      </PreviewSection>

      <PreviewSection title="Read-only: no onNew and no onAction, so no primary action and no More actions menu">
        <div className={frame}>
          <PageHeader leading={toggle}>
            <Body />
          </PageHeader>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
