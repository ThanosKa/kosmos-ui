'use client';

import { ThemeProvider } from 'next-themes';
import * as React from 'react';
import { cn } from '@/lib/cn';
import { NewItemStage } from '@/components/gallery/block-cards';
import { ActivityCard, EmptyCard, ReleaseCard } from '@/components/gallery/content-cards';
import { KpiCard, LoadingCard, MembersCard, RevenueCard, UsageCard } from '@/components/gallery/data-cards';
import { NotificationsCard, PlansCard, ProfileCard } from '@/components/gallery/form-cards';
import { CommandCard, DialogStage, DrawerStage, MenuStage, ShareStage, ToastStage } from '@/components/gallery/overlay-cards';
import { Toaster } from '@/registry/kosmos/ui/toast';
import { TooltipProvider } from '@/registry/kosmos/ui/tooltip';
import { DashboardShowcase } from './dashboard-showcase';
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

function Components() {
  return (
    <Columns className="columns-1 md:columns-2 xl:columns-3">
      <RevenueCard />
      <KpiCard />
      <MembersCard />
      <MenuStage />
      <CommandCard />
      <ReleaseCard />
      <UsageCard />
      <DialogStage />
      <ToastStage />
      <ActivityCard />
      <LoadingCard />
      <DrawerStage />
      <EmptyCard />
    </Columns>
  );
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
 * The Presets page preview as a whole document, for its iframe: Gallery cards for components and forms, and the Acme
 * dashboard. The preset the page sends applies to this document's root, so its menus, dialogs and toasts take it too.
 */
export function PresetPreviewDocument() {
  const { tokens, page } = usePreviewFrame(presetScreens[0].id);
  const [dashboardPage, setDashboardPage] = React.useState('overview');
  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange forcedTheme={tokens?.theme}>
      <TooltipProvider>
        {page === 'dashboard' ? (
          <DashboardShowcase page={dashboardPage} onPageChange={setDashboardPage} />
        ) : (
          <main className="mx-auto w-full max-w-7xl">{page === 'forms' ? <Forms /> : <Components />}</main>
        )}
        <Toaster />
      </TooltipProvider>
      <span data-preview-ready={tokens ? '' : undefined} hidden />
    </ThemeProvider>
  );
}
