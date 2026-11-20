import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFaq } from '@/components/site/landing-faq';
import { LandingGallery } from '@/components/site/landing-gallery/landing-gallery';
import { LandingHeroProduct } from '@/components/site/landing-hero-product';
import { LandingMotion } from '@/components/site/landing-motion';
import { LandingPricing } from '@/components/site/landing-pricing';
import { LandingSection } from '@/components/site/landing-section';
import { LandingShowcase } from '@/components/site/landing-showcase';
import { LandingStack } from '@/components/site/landing-stack';
import { SiteFooter } from '@/components/site/site-footer';
import { itemsInGroup, readRegistryItems } from '@/lib/registry';
import { appDescription, appName, docsRoute, siteOpenGraph } from '@/lib/shared';
import { Cta } from '@/registry/kosmos/blocks/cta/cta';
import { HeroProduct } from '@/registry/kosmos/blocks/hero/hero-product';
import { Button } from '@/registry/kosmos/ui/button';

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
      <LandingMotion />
      <main className="flex w-full flex-1 flex-col">
        <LandingSection id="hero" space="hero" column="wide" className="landing-hero">
          <HeroProduct
            title="Dashboard UI with the details already done"
            product={<LandingHeroProduct />}
            url="acme.example/overview"
            description="Base UI components and dashboard blocks you own, added with the shadcn CLI."
            actions={
              <>
                {/* `Button href` renders a plain <a>, which reloads the page; `render` keeps client navigation. */}
                <Button variant="primary" size="lg" nativeButton={false} render={<Link href={`${docsRoute}/installation`} />}>
                  Get started
                </Button>
                <Button variant="secondary" size="lg" nativeButton={false} render={<Link href={`${docsRoute}/blocks`} />}>
                  Browse blocks
                </Button>
              </>
            }
          />
        </LandingSection>
        <LandingSection id="stack">
          <LandingStack />
        </LandingSection>
        <LandingSection id="features" column="wide" title="The parts are already built">
          <LandingGallery />
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
              <Button variant="primary" size="lg" nativeButton={false} render={<Link href={`${docsRoute}/installation`} />}>
                Read the installation guide
              </Button>
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
