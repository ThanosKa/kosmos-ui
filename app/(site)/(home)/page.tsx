import type { Metadata } from 'next';
import Link from 'next/link';
import { ComponentBento } from '@/components/site/landing-bento';
import { LandingFaq } from '@/components/site/landing-faq';
import { LandingPricing } from '@/components/site/landing-pricing';
import { LandingSection } from '@/components/site/landing-section';
import { LandingShowcase } from '@/components/site/landing-showcase';
import { LandingStack } from '@/components/site/landing-stack';
import { SiteFooter } from '@/components/site/site-footer';
import { itemsInGroup, readRegistryItems } from '@/lib/registry';
import { appDescription, appName, docsRoute, siteOpenGraph } from '@/lib/shared';
import { Cta } from '@/registry/kosmos/blocks/cta/cta';
import { HeroProduct } from '@/registry/kosmos/blocks/hero/hero-product';
import { buttonVariants } from '@/registry/kosmos/ui/button';
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

  return (
    <>
      <main className="flex w-full flex-1 flex-col">
        <LandingSection id="hero" space="hero" column="wide" className="landing-hero">
          <HeroProduct
            title={<TextReveal>Dashboard UI with the details already done</TextReveal>}
            description={`${componentCount} components and ${blockCount} blocks on Base UI, added with the shadcn CLI as code you own. Free and open source under MIT.`}
            actions={
              <>
                {/* Router links styled as buttons: `Button href` renders a plain <a>, which reloads the page. */}
                <Link href={`${docsRoute}/installation`} className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                  Get started
                </Link>
                <Link href={`${docsRoute}/blocks`} className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
                  Browse blocks
                </Link>
              </>
            }
          />
        </LandingSection>
        <LandingSection id="stack">
          <LandingStack />
        </LandingSection>
        <LandingSection id="bento" column="wide" title="The small parts are already built">
          <ComponentBento />
        </LandingSection>
        <LandingSection id="showcase" column="wide" title="Whole screens from the same blocks">
          <LandingShowcase />
        </LandingSection>
        <LandingSection id="pricing" title="Free to build with, Pro when you want more">
          <LandingPricing componentCount={componentCount} blockCount={blockCount} />
        </LandingSection>
        <LandingSection id="faq" title="Questions before you install">
          <LandingFaq />
        </LandingSection>
        <LandingSection id="cta" space="last" title="Add your first block and keep every line of it">
          <Cta
            title={null}
            action={
              <Link href={`${docsRoute}/installation`} className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                Read the installation guide
              </Link>
            }
          />
        </LandingSection>
      </main>
      {/* The page footer closes the landing outside <main>, in a <div>, so it stays the page's footer landmark. */}
      <div data-landing-section="footer" className="pb-8">
        <SiteFooter />
      </div>
    </>
  );
}
