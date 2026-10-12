import { ArrowUpRight } from 'lucide-react';
import { formatChangelogDate } from '@/lib/changelog';
import Link from 'next/link';
import { Fragment } from 'react';
import type { DocsEyebrowPart, DocsNeighbours } from '@/lib/docs-nav';
import { packageRunners, registryNamespace } from '@/lib/registry';
import { Button } from '@/registry/kosmos/ui/button';
import { eyebrowClass } from './classes';
import { InstallChip } from './install-chip';
import { PageActions } from './page-actions';
import { PageNavButtons } from './page-nav';

/** `https://base-ui.com/react/components/scroll-area` → `Scroll Area`. */
function baseUiName(url: string) {
  return new URL(url).pathname
    .split('/')
    .at(-1)!
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

type DocsPageHeaderProps = {
  title: string;
  description?: string;
  date?: Date;
  markdownUrl: string;
  githubUrl: string;
  neighbours?: DocsNeighbours;
  /** Where the page sits in the sidebar, shown over the title. */
  eyebrow: DocsEyebrowPart[];
  /** The registry item a component or block page documents. Adds the Base UI and install chips. */
  item?: { name: string; baseUi?: string; baseUiName?: string };
};

/**
 * The top of a docs page: the eyebrow (sidebar section, group, and a changelog entry's date), the title row with the Copy page menu and previous/next,
 * the description, and on component and block pages the Base UI and install chips.
 */
export function DocsPageHeader({ title, description, date, markdownUrl, githubUrl, neighbours, eyebrow, item }: DocsPageHeaderProps) {
  return (
    <header data-docs-page-header="" className="flex flex-col gap-2 border-b border-border pb-6">
      <p data-docs-eyebrow="" className={eyebrowClass}>
        {eyebrow.map((part, index) => (
          <Fragment key={part.label}>
            {index > 0 && <span aria-hidden> · </span>}
            {part.url ? (
              <Link
                href={part.url}
                className="rounded-sm transition-[color] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {part.label}
              </Link>
            ) : (
              part.label
            )}
          </Fragment>
        ))}
        {date && (
          <>
            <span aria-hidden> · </span>
            <time dateTime={date.toISOString().slice(0, 10)}>{formatChangelogDate(date)}</time>
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h1 className="min-w-0 text-heading text-pretty text-foreground">{title}</h1>
        <div className="flex items-center gap-2">
          <PageActions markdownUrl={markdownUrl} githubUrl={githubUrl} />
          {neighbours && <PageNavButtons {...neighbours} />}
        </div>
      </div>
      {description && <p className="max-w-[40em] text-body text-pretty text-muted-foreground">{description}</p>}
      {item && (
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
          {item.baseUi && (
            <Button variant="secondary" size="sm" href={item.baseUi} target="_blank" rel="noreferrer">
              Base UI {item.baseUiName ?? baseUiName(item.baseUi)}
              <ArrowUpRight aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </Button>
          )}
          <InstallChip
            commands={Object.fromEntries(
              Object.entries(packageRunners).map(([manager, runner]) => [manager, `${runner} add ${registryNamespace}/${item.name}`]),
            )}
          />
        </div>
      )}
    </header>
  );
}
