'use client';

import type * as React from 'react';
import { AppSidebar } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { Hero, type HeroProps } from '@/registry/kosmos/blocks/hero/hero';
import { StatsOverview } from '@/registry/kosmos/blocks/stats-overview/stats-overview';
import { cn } from '@/registry/kosmos/lib/cn';
import { BrowserFrame } from '@/registry/kosmos/ui/browser-frame';
import { Glow } from '@/registry/kosmos/ui/glow';
import { SidebarInset, SidebarProvider } from '@/registry/kosmos/ui/sidebar';

function SampleDashboard() {
  return (
    <SidebarProvider storageKey={false} keyboardShortcut={false} className="h-full min-h-0">
      <AppSidebar activeItem="overview" onNavigate={(_id, event) => event.preventDefault()} />
      <SidebarInset render={<div />} className="overflow-hidden">
        <header className="flex h-12 shrink-0 items-center border-b border-border px-4">
          <h3 className="truncate text-body font-medium">Overview</h3>
        </header>
        <div className="p-4">
          <StatsOverview />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

type HeroProductProps = Omit<HeroProps, 'announcement'> & {
  /** The product under the actions: a live screen or an `<img>`. It is a picture, so keyboard and screen readers skip it. */
  product?: React.ReactNode;
  /** The address in the browser bar, without a scheme. `null` leaves the pill out. */
  url?: string | null;
};

/**
 * A marketing hero that shows the product: a title, one line and two actions, then a screen of the product in a flat
 * browser frame with a glow behind it that stays below the actions. The screen is cropped by the frame. The default screen is a live dashboard
 * built from App sidebar and Stats overview. Lays itself out by its own width and sets no padding around itself.
 */
function HeroProduct({ install = null, product, url = 'acme.example/overview', headingLevel = 1, className, ...props }: HeroProductProps) {
  return (
    <section data-slot="hero-product" className={cn('@container relative isolate overflow-hidden', className)}>
      <Hero announcement={null} install={install}headingLevel={headingLevel} {...props} />
      <div className="relative mx-auto mt-12 max-w-6xl @2xl:mt-16">
        <div data-slot="hero-product-glow" className="absolute -inset-x-20 -inset-y-10">
          <Glow position="center" />
        </div>
        <BrowserFrame url={url ?? undefined} className="relative">
          <div inert className="h-96 overflow-hidden select-none @3xl:h-136">
            {product ?? <SampleDashboard />}
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
}

export { HeroProduct, type HeroProductProps };
