'use client';

import { ThemeProvider } from 'next-themes';
import * as React from 'react';
import { cn } from '@/lib/cn';
import { NewItemStage } from '@/components/gallery/block-cards';
import { NotificationsCard, PlansCard, ProfileCard } from '@/components/gallery/form-cards';
import { ShareStage } from '@/components/gallery/overlay-cards';
import { Toaster } from '@/registry/kosmos/ui/toast';
import { TooltipProvider } from '@/registry/kosmos/ui/tooltip';
import { DashboardShowcase } from './dashboard-showcase';
import { PresetComponents } from './preset-components';
import { usePreviewFrame } from './preset-frame';

/** The screens of the Presets page preview, in their tab order. */
export const presetScreens = [
  { id: 'components', label: 'Components' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'forms', label: 'Forms' },
] as const;

/** Cards in columns that fill top to bottom, so cards of any height pack with no gaps. */
function Columns({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={cn('gap-4 p-4 sm:p-6 *:mb-4 *:break-inside-avoid', className)}>{children}</div>;
}

function Forms() {
  return (
    <Columns className="columns-1 md:columns-2">
      <ProfileCard />
      <NotificationsCard />
      <NewItemStage />
      <PlansCard />
      <ShareStage />
    </Columns>
  );
}

/**
 * The Presets page preview as a whole document, for its iframe: composed cards for components, Gallery cards for forms, and the Acme
 * dashboard. The site's preset applies to this document's root, so its menus, dialogs and toasts take it too.
 */
export function PresetPreviewDocument() {
  const { ready, page } = usePreviewFrame(presetScreens[0].id);
  const [dashboardPage, setDashboardPage] = React.useState('overview');
  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        {page === 'dashboard' ? (
          <DashboardShowcase page={dashboardPage} onPageChange={setDashboardPage} />
        ) : (
          <main className="mx-auto w-full max-w-7xl">{page === 'forms' ? <Forms /> : <PresetComponents />}</main>
        )}
        <Toaster />
      </TooltipProvider>
      <span data-preview-ready={ready ? '' : undefined} hidden />
    </ThemeProvider>
  );
}
