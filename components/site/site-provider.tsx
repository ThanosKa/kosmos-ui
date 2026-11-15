'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import { ChartEntranceContext } from '@/registry/kosmos/hooks/use-chart-motion';
import { SearchDialog, SearchLabelsProvider } from './search-dialog';
import type { SearchLabels } from './search-index';

/**
 * Theme and docs search for every site page. Fumadocs keeps the ⌘K shortcut and the search API; the dialog is ours. The
 * site is a showcase, so every chart plays its entrance on each load.
 */
export function SiteProvider({ searchLabels, children }: { searchLabels: SearchLabels; children: ReactNode }) {
  return (
    <SearchLabelsProvider value={searchLabels}>
      <RootProvider search={{ SearchDialog }}>
        <ChartEntranceContext value="always">{children}</ChartEntranceContext>
      </RootProvider>
    </SearchLabelsProvider>
  );
}
