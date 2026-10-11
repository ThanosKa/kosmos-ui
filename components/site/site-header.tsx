import Link from 'next/link';
import { appName, author } from '@/lib/shared';
import { Button } from '@/registry/kosmos/ui/button';
import { XIcon } from './brand-icons';
import { GitHubLink } from './github-link';
import { KosmosMark } from './kosmos-mark';
import { SearchButton } from './search-button';
import { SiteNav, SiteNavMenu } from './site-nav';
import { ThemeToggle } from './theme-toggle';

/** The site header on the landing page: logo, docs links, search, GitHub, X and the theme toggle. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-1 px-4 sm:px-6">
        <SiteNavMenu className="-ms-1.5 md:hidden" />
        <Link
          href="/"
          className="-mx-1 flex items-center gap-2 rounded-lg px-1 py-1 text-body font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <KosmosMark className="size-5" />
          {appName}
        </Link>
        <SiteNav className="ms-4 max-md:hidden" />
        <div className="ms-auto flex items-center gap-1">
          <SearchButton />
          <GitHubLink />
          <Button variant="ghost" size="icon" href={author.xUrl} aria-label={`${author.name} on X`}>
            <XIcon className="size-3.5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
