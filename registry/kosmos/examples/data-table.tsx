'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import DataTableDemo from '@/registry/kosmos/examples/data-table-demo';

export default function DataTablePreview() {
  return (
    <PreviewStack>
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
    </PreviewStack>
  );
}
