'use client';

import { ThemeProvider } from 'next-themes';
import * as React from 'react';
import { cn } from '@/lib/cn';
import { CommandMenuStage, DetailDrawerStage, NewItemStage } from '@/components/preset-cards/block-cards';
import { NotificationsCard, PlansCard, ProfileCard } from '@/components/preset-cards/form-cards';
import { CommandCard, DialogStage, DrawerStage, MenuStage, ShareStage, ToastStage } from '@/components/preset-cards/overlay-cards';
import type { TokenOverview } from '@/lib/foundations';
import { Toaster } from '@/registry/kosmos/ui/toast';
import { TooltipProvider } from '@/registry/kosmos/ui/tooltip';
import { DashboardShowcase } from './dashboard-showcase';
import { PresetComponents } from './preset-components';
import { usePreviewFrame } from './preset-frame';
import { PresetTokens } from './preset-tokens';

/** The screens of the Presets page preview, in their tab order. */
export const presetScreens = [
  { id: 'components', label: 'Components' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'forms', label: 'Forms' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'tokens', label: 'Tokens' },
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
    </Columns>
  );
}

/** Every overlay pinned open at once, which no app screen ever shows. */
function Overlays() {
  return (
    <Columns className="columns-1 md:columns-2 xl:columns-3">
      <DialogStage />
      <MenuStage />
      <ToastStage />
      <ShareStage />
      <CommandCard />
      <DrawerStage />
      <CommandMenuStage />
      <DetailDrawerStage />
    </Columns>
  );
}

/**
 * The Presets page preview as a whole document, for its iframe: composed cards for components, the Acme dashboard, forms,
 * overlays pinned open and the tokens. The site's preset applies to this document's root, so its menus, dialogs and
 * toasts take it too.
 */
export function PresetPreviewDocument({ tokens }: { tokens: TokenOverview }) {
  const { ready, page } = usePreviewFrame(presetScreens[0].id);
  const [dashboardPage, setDashboardPage] = React.useState('overview');
  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        {page === 'dashboard' ? (
          <DashboardShowcase page={dashboardPage} onPageChange={setDashboardPage} />
        ) : (
          <main className="mx-auto w-full max-w-7xl">
            {page === 'forms' ? <Forms /> : page === 'overlays' ? <Overlays /> : page === 'tokens' ? <PresetTokens tokens={tokens} /> : <PresetComponents />}
          </main>
        )}
        <Toaster />
      </TooltipProvider>
      <span data-preview-ready={ready ? '' : undefined} hidden />
    </ThemeProvider>
  );
}
