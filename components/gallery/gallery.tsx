'use client';

import type { ReactNode } from 'react';
import { AppFrame, CommandMenuStage, DetailDrawerStage, NewItemStage, RoadmapCard } from '@/components/gallery/block-cards';
import { ActivityCard, EmptyCard, ReleaseCard } from '@/components/gallery/content-cards';
import { KpiCard, LoadingCard, MembersCard, RevenueCard, UsageCard } from '@/components/gallery/data-cards';
import { NotificationsCard, PlansCard, ProfileCard } from '@/components/gallery/form-cards';
import { CommandCard, DialogStage, DrawerStage, MenuStage, ShareStage, ToastStage } from '@/components/gallery/overlay-cards';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { StatsOverview } from '@/registry/kosmos/blocks/stats-overview/stats-overview';
import { Toaster } from '@/registry/kosmos/ui/toast';
import { TooltipProvider } from '@/registry/kosmos/ui/tooltip';

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h2 id={id} className="text-title">
          {title}
        </h2>
        <p className="text-small text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

/** One column of cards from `lg` up; below it the columns stack in order. */
function Column({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-4">{children}</div>;
}

/**
 * The gallery: every Kosmos component in realistic cards, then cuts of the blocks. Overlays are pinned
 * open inside small stages, so one screenshot shows every surface at once.
 */
export function Gallery() {
  return (
    <TooltipProvider>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-caption tracking-[0.05em] text-muted-foreground uppercase">Kosmos UI</p>
            <h1 className="text-heading">Gallery</h1>
            <p className="max-w-[40em] text-small text-pretty text-muted-foreground">
              Every component in realistic cards, with the overlays pinned open. Change a token or a style rule and
              check its effect here, in light and dark.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <Section id="gallery-components" title="Components" description="All components, composed the way an app uses them.">
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            <Column>
              <RevenueCard />
              <MembersCard />
              <ProfileCard />
              <UsageCard />
              <DialogStage />
            </Column>
            <Column>
              <KpiCard />
              <CommandCard />
              <MenuStage />
              <NotificationsCard />
              <ToastStage />
              <LoadingCard />
              <EmptyCard />
            </Column>
            <Column>
              <PlansCard />
              <ReleaseCard />
              <ShareStage />
              <ActivityCard />
              <DrawerStage />
            </Column>
          </div>
        </Section>

        <Section id="gallery-blocks" title="Blocks" description="Cuts of the blocks, with their sample data.">
          <StatsOverview />
          <AppFrame />
          <RoadmapCard />
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            <NewItemStage />
            <CommandMenuStage />
          </div>
          <DetailDrawerStage />
        </Section>
      </main>
      <Toaster />
    </TooltipProvider>
  );
}
