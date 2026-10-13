import type { Metadata } from 'next';
import Link from 'next/link';
import { GitHubIcon } from '@/components/site/brand-icons';
import { DashboardCanvas } from '@/components/site/dashboard-canvas';
import { LandingInstall, landingInstallHeadingId } from '@/components/site/landing-install';
import { LandingProof, landingProofHeadingId } from '@/components/site/landing-proof';
import { LandingSection, type LandingSectionProps } from '@/components/site/landing-section';
import { SiteFooter } from '@/components/site/site-footer';
import { itemsInGroup, packageRunners, readRegistryItems, registryAddArgs } from '@/lib/registry';
import { appDescription, appName, githubUrl, siteOpenGraph } from '@/lib/shared';
import { Hero } from '@/registry/kosmos/blocks/hero/hero';
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

export default function HomePage() {
  const items = readRegistryItems();
  const componentCount = items.filter((item) => item.type === 'registry:ui').length;
  const blockCount = itemsInGroup('blocks', items).length;

  // The landing, top to bottom. Each section is built from Kosmos blocks and its label links them.
  const sections: LandingSectionProps[] = [
    {
      id: 'hero',
      blocks: ['hero'],
      children: (
        <Hero
          title="Dashboard UI with the details already done"
          description={`${componentCount} components and ${blockCount} blocks, installed from the shadcn registry. Free and open source under MIT.`}
          actions={
            <>
              {/* A router link styled as a button: `Button href` renders a plain <a>, which reloads the page. */}
              <Link href="/docs/components" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                Browse components
              </Link>
              <Button variant="secondary" size="lg" href={githubUrl}>
                <GitHubIcon data-icon="inline-start" />
                GitHub
              </Button>
            </>
          }
          command={`${packageRunners.npm} ${registryAddArgs}`}
          className="px-0 pb-0 @2xl:px-0 @2xl:pb-0"
        />
      ),
    },
    {
      id: 'dashboard',
      blocks: dashboardBlocks,
      srHeading: 'Live dashboard',
      children: <DashboardCanvas />,
    },
    {
      id: 'install',
      components: ['tabs', 'button'],
      labelledBy: landingInstallHeadingId,
      children: <LandingInstall />,
    },
    {
      id: 'proof',
      components: ['button'],
      labelledBy: landingProofHeadingId,
      children: <LandingProof />,
    },
  ];

  // The page footer closes the landing outside <main>, in a <div>, so it stays the page's footer landmark.
  const footer: LandingSectionProps = {
    id: 'footer',
    blocks: ['footer'],
    as: 'div',
    className: 'pb-8',
    children: <SiteFooter />,
  };

  return (
    <>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-14 px-4 pb-16 sm:gap-20 sm:px-6 sm:pb-24">
        {sections.map((section) => (
          <LandingSection key={section.id} {...section} />
        ))}
      </main>
      <LandingSection {...footer} />
    </>
  );
}
