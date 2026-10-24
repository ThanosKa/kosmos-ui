import type { ReactNode } from 'react';
import { author } from '@/lib/shared';
import { Button } from '@/registry/kosmos/ui/button';
import { XIcon } from './brand-icons';
import { GitHubLink } from './github-link';
import { SearchButton } from './search-button';
import { SiteNavbar } from './site-navbar';
import { ThemeToggle } from './theme-toggle';

type SiteHeaderProps = {
  /** Replaces the button that opens the sheet of site links below 768px. */
  menu?: ReactNode;
  /** Spans the whole window instead of the centered column, so the logo lines up with a docked sidebar. */
  fullWidth?: boolean;
};

/** The site header on the landing page and the docs, built from the Navbar block: logo, site links, search, GitHub, X and the theme toggle. */
export function SiteHeader({ menu, fullWidth = false }: SiteHeaderProps) {
  return (
    <SiteNavbar
      id="site-header"
      menu={menu}
      fullWidth={fullWidth}
      actions={
        <>
          <SearchButton />
          <GitHubLink />
          <Button variant="secondary" size="icon" href={author.xUrl} aria-label={`${author.name} on X`}>
            <XIcon className="size-3.5" />
          </Button>
          <ThemeToggle />
        </>
      }
    />
  );
}
