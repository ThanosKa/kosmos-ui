import { LandingSection } from '@/components/site/landing-section';
import { LandingShowcase } from '@/components/site/landing-showcase';
import { LandingStack } from '@/components/site/landing-stack';
import { PrototypeSwitcher } from '@/components/site/prototype-bento/switcher';
import { prototypeVariants, VariantRows, VariantStage, VariantSurface } from '@/components/site/prototype-bento/variants';

/** Prototype: three variants of the landing's bento section, switchable with `?variant=A|B|C`. Delete after the decision. */
export default async function PrototypeBentoPage({ searchParams }: { searchParams: Promise<{ variant?: string }> }) {
  const { variant = 'A' } = await searchParams;
  return (
    <>
      <main className="flex w-full flex-1 flex-col pt-16">
        <LandingSection id="stack">
          <LandingStack />
        </LandingSection>
        <LandingSection id="bento" column="wide" title="The small parts are already built">
          {variant === 'A' && <VariantRows />}
          {variant === 'B' && <VariantSurface />}
          {variant === 'C' && <VariantStage />}
        </LandingSection>
        <LandingSection id="showcase" column="wide" title="Whole screens from the same blocks">
          <LandingShowcase />
        </LandingSection>
      </main>
      <PrototypeSwitcher variants={prototypeVariants} current={variant} />
    </>
  );
}
