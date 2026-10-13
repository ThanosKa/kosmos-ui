import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { appName, author } from '@/lib/shared';
import { Button } from '@/registry/kosmos/ui/button';
import { XIcon } from './brand-icons';
import { GitHubLink } from './github-link';
import { KosmosMark } from './kosmos-mark';
import { SearchButton } from './search-button';
import { SiteNav, SiteNavMenu } from './site-nav';
import { ThemeToggle } from './theme-toggle';

type SiteHeaderProps = {
  /** The control before the logo below the `md` breakpoint. Defaults to a menu of the Docs, Components and Blocks links. */
  menu?: ReactNode;
  /** Spans the whole window instead of the centered column, so the logo lines up with a docked sidebar. */
  fullWidth?: boolean;
};

/** The site header on the landing page and the docs: logo, section links, search, GitHub, X and the theme toggle. */
export function SiteHeader({ menu = <SiteNavMenu className="me-2 md:hidden" />, fullWidth = false }: SiteHeaderProps) {
  return (
    <header id="site-header" className="sticky top-0 z-40 border-b border-border bg-background">
      <div className={cn('mx-auto flex h-14 w-full items-center gap-1 px-4', !fullWidth && 'max-w-7xl sm:px-6')}>
        {menu}
        <Link
          href="/"
          className="-mx-1 flex shrink-0 items-center gap-2 rounded-lg px-1 py-1 text-body font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <KosmosMark className="size-5" />
          {appName}
        </Link>
        <SiteNav className="ms-4 max-md:hidden" />
        <div className="ms-auto flex items-center gap-1.5">
          <SearchButton />
          <GitHubLink />
          <Button variant="secondary" size="icon" href={author.xUrl} aria-label={`${author.name} on X`}>
            <XIcon className="size-3.5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
