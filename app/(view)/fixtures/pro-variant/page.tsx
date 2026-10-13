import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { BlockVariants } from '@/components/docs/block-viewer';
import { getBlockCategory, type ProVariant } from '@/lib/registry';

export const metadata: Metadata = { title: 'Pro variant fixture' };

/** A made-up Pro variant for `pnpm docs:check`. It is not a real variant and exists only on the dev server. */
const fixture: ProVariant = {
  name: 'data-table-fixture',
  title: 'Data table fixture',
  category: 'data-table',
  previewUrl: '/view/data-table-demo',
};

/** The Data table category page's block viewers with the fixture added as a Pro variant, through the same reader. */
export default function ProVariantFixturePage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const category = getBlockCategory(fixture.category, undefined, [fixture]);
  if (!category) notFound();

  return (
    <RootProvider search={{ enabled: false }} theme={{ hotKey: false }}>
      <main className="mx-auto w-full max-w-7xl p-6">
        <BlockVariants category={category} />
      </main>
    </RootProvider>
  );
}
