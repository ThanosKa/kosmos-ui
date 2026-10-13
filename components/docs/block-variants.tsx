import { blockTiers, packageRunners, registryNamespace, type BlockCategory, type BlockTier, type BlockVariant } from '@/lib/registry';
import { Badge } from '@/registry/kosmos/ui/badge';
import { ComponentPreview } from './component-preview';
import { InstallChip } from './install-chip';

const tierBadges: Record<BlockTier, 'green' | 'orange'> = { free: 'green', pro: 'orange' };

/** The variants of a block category, one under another, free first. Each has an anchor named after it. */
export function BlockVariants({ category }: { category: BlockCategory }) {
  return (
    <div className="not-prose flex flex-col gap-10">
      {category.variants.map((variant) => (
        <BlockVariantSection key={variant.name} variant={variant} />
      ))}
    </div>
  );
}

function BlockVariantSection({ variant }: { variant: BlockVariant }) {
  const headingId = `${variant.name}-heading`;
  return (
    <section
      id={variant.name}
      data-block-variant=""
      data-tier={variant.tier}
      aria-labelledby={headingId}
      className="flex min-w-0 scroll-mt-20 flex-col gap-3 [&>[data-slot=component-preview]]:my-0"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <h2 id={headingId} className="text-title text-foreground">
          {variant.title}
        </h2>
        <Badge variant={tierBadges[variant.tier]}>{blockTiers[variant.tier]}</Badge>
        {variant.tier === 'free' && (
          <div className="ms-auto flex min-w-0">
            <InstallChip
              commands={Object.fromEntries(
                Object.entries(packageRunners).map(([manager, runner]) => [manager, `${runner} add ${registryNamespace}/${variant.name}`]),
              )}
            />
          </div>
        )}
      </div>
      {variant.tier === 'free' && <ComponentPreview name={`${variant.name}-demo`} pageItem={variant.name} />}
    </section>
  );
}
