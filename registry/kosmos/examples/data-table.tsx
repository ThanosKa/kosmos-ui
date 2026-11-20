'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import DataTableDemo from '@/registry/kosmos/examples/data-table-demo';
import { DataSetPreview } from '@/components/preview/data-set-preview';

function Normal() {
  return (
    <>
      <PreviewSection title="Search, filters, column menus and five rows a page">
        <DataTableDemo />
      </PreviewSection>

      <PreviewSection title="Loading">
        <DataTableDemo loading />
      </PreviewSection>

      <PreviewSection title="No rows">
        <DataTableDemo rows={[]} />
      </PreviewSection>

      <PreviewSection title="In a narrow container">
        <div className="max-w-sm">
          <DataTableDemo />
        </div>
      </PreviewSection>
    </>
  );
}

const worstProjects = [
  { id: 'copperline-eu', name: 'Copperline Bank server events for card payments, loans and the business portal', plan: 'scale', status: 'live', users: 1284903772, mrr: 1284903 },
  { id: 'saltmarsh-gr', name: 'Ιστότοπος καφέ Saltmarsh 🌊', plan: 'pro', status: 'trial', users: 0, mrr: 0 },
  { id: 'k', name: 'K', plan: 'free', status: 'paused', users: 1, mrr: 0 },
  { id: 'path', name: 'payments-gateway.eu-west.copperline.example/docs/dashboards/share', plan: 'pro', status: 'live', users: 6120, mrr: 149 },
  { id: 'jp', name: '株式会社サンプル・ロジスティクス', plan: 'scale', status: 'live', users: 4780, mrr: 2900 },
] satisfies Parameters<typeof DataTableDemo>[0]['rows'];

function Worst() {
  return (
    <>
      <PreviewSection title="Long names, huge numbers, a zero and a one-letter name">
        <DataTableDemo rows={worstProjects} />
      </PreviewSection>

      <PreviewSection title="In a narrow container">
        <div className="max-w-sm">
          <DataTableDemo rows={worstProjects} />
        </div>
      </PreviewSection>
    </>
  );
}

export default function DataTablePreview() {
  return (
    <DataSetPreview
      demo={
        <PreviewStack>
          <Normal />
        </PreviewStack>
      }
      worst={
        <PreviewStack>
          <Worst />
        </PreviewStack>
      }
    />
  );
}
