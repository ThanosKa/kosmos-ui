import type { Metadata } from 'next';
import Link from 'next/link';
import { GitHubIcon } from '@/components/site/brand-icons';
import { ComponentBento } from '@/components/site/landing-bento';
import { LandingFaq } from '@/components/site/landing-faq';
import { Inventory, landingInventoryHeadingId } from '@/components/site/landing-inventory';
import { LandingPricing } from '@/components/site/landing-pricing';
import { LandingSection, type LandingSectionProps } from '@/components/site/landing-section';
import { LandingStack } from '@/components/site/landing-stack';
import { SiteFooter } from '@/components/site/site-footer';
import { itemsInGroup, readRegistryItems } from '@/lib/registry';
import { appDescription, appName, docsRoute, githubUrl, siteOpenGraph } from '@/lib/shared';
import { Cta } from '@/registry/kosmos/blocks/cta/cta';
import { Hero } from '@/registry/kosmos/blocks/hero/hero';
import { Showcase } from '@/registry/kosmos/blocks/showcase/showcase';
import { Announcement } from '@/registry/kosmos/ui/announcement';
import { Button, buttonVariants } from '@/registry/kosmos/ui/button';
import { FlickeringGrid } from '@/registry/kosmos/ui/flickering-grid';
import { TextReveal } from '@/registry/kosmos/ui/text-reveal';

const title = `${appName}: Components and blocks for dashboard apps`;

export const metadata: Metadata = {
  title: { absolute: title },
  description: appDescription,
  openGraph: { ...siteOpenGraph, title, description: appDescription, url: '/' },
};

export default function HomePage() {
  const items = readRegistryItems();
  const componentCount = items.filter((item) => item.type === 'registry:ui').length;
  const blockCount = itemsInGroup('blocks', items).length;

  const sections: LandingSectionProps[] = [
    {
      id: 'hero',
      space: 'hero',
      background: <FlickeringGrid spotlight className="mask-[radial-gradient(ellipse_60%_80%_at_50%_40%,black,transparent)]" />,
      children: (
        <Hero
          announcement={
            <Announcement badge="New" render={<Link href="/presets" />}>
              Presets: pick a look and copy its CSS
            </Announcement>
          }
          title={<TextReveal>Dashboard UI with the details already done</TextReveal>}
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
          install={null}
        />
      ),
    },
    {
      id: 'showcase',
      srHeading: 'Kosmos blocks, live',
      column: 'wide',
      children: <Showcase />,
    },
    {
      id: 'stack',
      children: <LandingStack />,
    },
    {
      id: 'bento',
      column: 'wide',
      children: <ComponentBento />,
    },
    {
      id: 'inventory',
      labelledBy: landingInventoryHeadingId,
      column: 'wide',
      children: <Inventory />,
    },
    {
      id: 'pricing',
      children: <LandingPricing componentCount={componentCount} blockCount={blockCount} />,
    },
    {
      id: 'faq',
      children: <LandingFaq />,
    },
    {
      id: 'cta',
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
      <div data-landing-section="footer" className="pb-8">
        <SiteFooter />
      </div>
    </>
  );
}
