import { Lock } from 'lucide-react';
import { addCommands, blockTiers, getRegistryItem, type BlockCategory, type BlockTier, type BlockVariant } from '@/lib/registry';
import { proUrl } from '@/lib/shared';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { BlockViewerPanels } from './block-viewer-panels';
import { ComponentSource } from './component-install';
import { InstallChip } from './install-chip';

const tierBadges: Record<BlockTier, 'green' | 'orange'> = { free: 'green', pro: 'orange' };

/** The variants of a block category, each in its own block viewer, free first. Each has an anchor named after it. */
export function BlockViewers({ category }: { category: BlockCategory }) {
  return (
    <div className="not-prose flex flex-col gap-12">
      {category.variants.map((variant) => (
        <BlockViewer key={variant.name} variant={variant} />
      ))}
    </div>
  );
}

/**
 * One variant of a block category: its name and tier over a live preview, at desktop, tablet or phone width, and its
 * code. Everything comes from the variant's data: a free variant shows every file of its registry item and its install
 * command; a Pro variant, whose code never enters this repo, shows its code locked (with a link to Pro once it sells).
 */
function BlockViewer({ variant }: { variant: BlockVariant }) {
  const headingId = `${variant.name}-heading`;
  const item = variant.tier === 'free' ? getRegistryItem(variant.name) : undefined;

  return (
    <section
      id={variant.name}
      data-block-variant=""
      data-tier={variant.tier}
      aria-labelledby={headingId}
      className="flex min-w-0 scroll-mt-20 flex-col gap-3"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <h2 id={headingId} className="text-title text-foreground">
          {variant.title}
        </h2>
        <Badge variant={tierBadges[variant.tier]}>{blockTiers[variant.tier]}</Badge>
        {item && (
          <div className="ms-auto flex min-w-0">
            <InstallChip commands={addCommands(item.name)} />
          </div>
        )}
      </div>
      <BlockViewerPanels
        title={variant.title}
        previewUrl={variant.previewUrl}
        locked={!item}
        code={
          item ? (
            <div className="divide-y divide-border">
              <ComponentSource name={item.name} item={item} embedded />
            </div>
          ) : (
            <LockedCode />
          )
        }
      />
    </section>
  );
}

function LockedCode() {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center gap-3 p-6 text-center">
      <Lock aria-hidden className="size-4 text-muted-foreground" />
      <p className="max-w-[32em] text-body text-pretty text-muted-foreground">
        {proUrl ? 'The code of this variant comes with Pro.' : 'The code of this variant comes with Pro, which is not on sale yet. Try it live in Preview.'}
      </p>
      {proUrl && (
        <Button variant="secondary" href={proUrl}>
          Get Pro
        </Button>
      )}
    </div>
  );
}
