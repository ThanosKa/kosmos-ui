import { Card, Cards } from 'fumadocs-ui/components/card';
import { source } from '@/lib/source';

/** The pages directly inside a docs folder (`components`, `blocks`), by title, without its index page. */
export function docsInFolder(folder: string) {
  return source
    .getPages()
    .filter((page) => page.slugs.length === 2 && page.slugs[0] === folder)
    .sort((a, b) => a.data.title.localeCompare(b.data.title));
}

/** A card for every page in a docs folder, so the overview never needs a hand-kept list. */
export function DocsIndex({ folder }: { folder: string }) {
  return (
    <Cards>
      {docsInFolder(folder).map((page) => (
        <Card key={page.url} title={page.data.title} description={page.data.description} href={page.url} />
      ))}
    </Cards>
  );
}
