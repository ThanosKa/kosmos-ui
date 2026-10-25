import type { Metadata } from 'next';
import Link from 'next/link';
import { GitHubIcon } from '@/components/site/brand-icons';
import { DashboardCanvas } from '@/components/site/dashboard-canvas';
import { InstallTabs } from '@/components/site/install-tabs';
import { ComponentBento } from '@/components/site/landing-bento';
import { LandingFaq } from '@/components/site/landing-faq';
import { Inventory, landingInventoryHeadingId } from '@/components/site/landing-inventory';
import { LandingPricing } from '@/components/site/landing-pricing';
import { BlockLabel, LandingSection, LandingTitle, type LandingSectionProps } from '@/components/site/landing-section';
import { LandingStack } from '@/components/site/landing-stack';
import { SiteFooter } from '@/components/site/site-footer';
import { itemsInGroup, packageRunners, readRegistryItems, registryAddArgs } from '@/lib/registry';
import { appDescription, appName, docsRoute, githubUrl, siteOpenGraph } from '@/lib/shared';
import { Cta } from '@/registry/kosmos/blocks/cta/cta';
import { Hero } from '@/registry/kosmos/blocks/hero/hero';
import { Announcement } from '@/registry/kosmos/ui/announcement';
import { Button, buttonVariants } from '@/registry/kosmos/ui/button';

const title = `${appName}: Components and blocks for dashboard apps`;

export const metadata: Metadata = {
  title: { absolute: title },
  description: appDescription,
  openGraph: { ...siteOpenGraph, title, description: appDescription, url: '/' },
};

/** The eight application blocks the dashboard is composed from, in the order a visitor meets them. */
const dashboardBlocks = [
  'app-sidebar',
  'stats-overview',
  'page-header',
  'data-table',
  'detail-drawer',
  'kanban-board',
  'new-item-dialog',
  'command-menu',
];

const dashboardHeadingId = 'landing-dashboard-heading';

/** The first command of an install, adding the @kosmos registry, for each package manager. */
const registryCommands = Object.fromEntries(Object.entries(packageRunners).map(([manager, runner]) => [manager, `${runner} ${registryAddArgs}`]));

export default function HomePage() {
  const items = readRegistryItems();
  const componentCount = items.filter((item) => item.type === 'registry:ui').length;
  const blockCount = itemsInGroup('blocks', items).length;

  const sections: LandingSectionProps[] = [
    {
      id: 'hero',
      blocks: ['hero'],
      components: ['announcement', 'code-tabs'],
      space: 'hero',
      children: (
        <Hero
          announcement={
            <Announcement badge="New" render={<Link href="/presets" />}>
              Presets: pick a look and copy its CSS
            </Announcement>
          }
          title="Dashboard UI with the details already done"
          description={`${componentCount} components and ${blockCount} blocks on Base UI, added with the shadcn CLI as code you own. Free and open source under MIT.`}
          actions={
            <>
              {/* A router link styled as a button: `Button href` renders a plain <a>, which reloads the page. */}
              <Link href={`${docsRoute}/components`} className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                Browse components
              </Link>
              <Button variant="secondary" size="lg" href={githubUrl}>
                <GitHubIcon data-icon="inline-start" />
                GitHub
              </Button>
            </>
          }
          install={<InstallTabs commands={registryCommands} />}
        />
      ),
    },
    {
      id: 'stack',
      blocks: ['logo-marquee'],
      children: <LandingStack />,
    },
    {
      id: 'dashboard',
      blocks: dashboardBlocks,
      labelledBy: dashboardHeadingId,
      column: 'wide',
      children: (
        <>
          <LandingTitle id={dashboardHeadingId}>
            A whole app from the blocks,
            <br />
            in the preset you pick
          </LandingTitle>
          <DashboardCanvas />
        </>
      ),
    },
    {
      id: 'bento',
      blocks: ['bento'],
      column: 'wide',
      children: <ComponentBento />,
    },
    {
      id: 'inventory',
      blocks: ['bento'],
      components: ['tabs'],
      labelledBy: landingInventoryHeadingId,
      column: 'wide',
      children: <Inventory />,
    },
    {
      id: 'pricing',
      blocks: ['pricing'],
      children: <LandingPricing componentCount={componentCount} blockCount={blockCount} />,
    },
    {
      id: 'faq',
      blocks: ['faq'],
      children: <LandingFaq />,
    },
    {
      id: 'cta',
      blocks: ['cta'],
      space: 'last',
      children: (
        <Cta
          title={
            <>
              Add your first block,
              <br />
              keep every line of it
            </>
          }
          action={
            <Link href={`${docsRoute}/installation`} className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              Read the installation guide
            </Link>
          }
        />
      ),
    },
  ];

  return (
    <>
      <main className="flex w-full flex-1 flex-col">
        {sections.map((section) => (
          <LandingSection key={section.id} {...section} />
        ))}
      </main>
      {/* The page footer closes the landing outside <main>, in a <div>, so it stays the page's footer landmark. */}
      <div data-landing-section="footer" className="flex flex-col gap-6 pb-8">
        <SiteFooter />
        <BlockLabel blocks={['footer']} />
      </div>
    </>
  );
}
