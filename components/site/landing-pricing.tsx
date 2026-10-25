import Link from 'next/link';
import { docsRoute, licenseUrl, proUrl } from '@/lib/shared';
import { Pricing, type PricingPlan } from '@/registry/kosmos/blocks/pricing/pricing';
import { buttonVariants } from '@/registry/kosmos/ui/button';
import { cn } from '@/registry/kosmos/lib/cn';

const inlineLink =
  'rounded-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/**
 * The landing's pricing: Free, which is this repository, and Pro, raised on a card. The Pro link is the brand's Pro
 * mark (`brand-primary`): it opens the store once there is one, and the blocks until then.
 */
export function LandingPricing({ componentCount, blockCount }: { componentCount: number; blockCount: number }) {
  const plans: PricingPlan[] = [
    {
      name: 'Free',
      description: 'Everything in this repository, for any project.',
      price: '$0',
      period: 'MIT license',
      features: [
        `All ${componentCount} components`,
        `${blockCount} blocks for apps, marketing pages and AI products`,
        'Every preset, with its CSS and DESIGN.md',
        'Docs as Markdown for your agent',
      ],
      action: (
        <Link href={`${docsRoute}/components`} className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
          Browse components
        </Link>
      ),
    },
    {
      name: 'Pro',
      description: 'More of every block, and whole apps to start from.',
      price: 'Pay once',
      period: 'updates included',
      features: ['Everything in Free', 'More variants in every block category', 'Templates you can run as whole apps', 'Installs with the same shadcn CLI'],
      action: (
        <Link
          href={proUrl ?? `${docsRoute}/blocks`}
          className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'brand-primary hover:not-data-disabled:bg-brand-hover')}
        >
          {proUrl ? 'Get Pro' : 'Browse the blocks'}
        </Link>
      ),
      featured: true,
    },
  ];

  return (
    <Pricing
      title={
        <>
          Free to build with,
          <br />
          Pro when you want more
        </>
      }
      description={null}
      plans={plans}
      footnote={
        <>
          Free stays free, for personal and commercial work.{' '}
          <a href={licenseUrl} className={inlineLink}>
            Read the license
          </a>
        </>
      }
    />
  );
}
