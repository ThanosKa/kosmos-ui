import type { Metadata } from 'next';
import { PresetsView } from '@/components/site/presets-view';
import { choiceFromParams } from '@/lib/presets';
import { packageRunners, registryAddArgs } from '@/lib/registry';
import { siteOpenGraph } from '@/lib/shared';
import { sharedPresetScript } from '@/lib/site-preset';

const description =
  'Pick a Kosmos preset, its accent, radius and theme, see components, a dashboard, forms, overlays and every token take it, and get its CSS, registry command and DESIGN.md.';

export const metadata: Metadata = {
  title: 'Presets',
  description,
  alternates: { canonical: '/presets' },
  openGraph: { ...siteOpenGraph, title: 'Presets', description, url: '/presets' },
};

/** `/presets`: the Presets page. `?preset=&accent=&radius=` name a choice, so a link shares it and makes it the site's preset. */
export default async function PresetsPage(props: PageProps<'/presets'>) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(
    Object.entries(searchParams).flatMap(([key, value]) => (typeof value === 'string' ? [[key, value]] : [])),
  );
  const shared = ['preset', 'accent', 'radius'].some((key) => params.has(key)) ? choiceFromParams(params) : null;
  return (
    <>
      {shared ? <script dangerouslySetInnerHTML={{ __html: sharedPresetScript(shared) }} /> : null}
      <PresetsView sharedChoice={shared} runners={packageRunners} registryAdd={registryAddArgs} />
    </>
  );
}
